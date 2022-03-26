import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import {
  createStyles,
  makeStyles,
  Theme,
  useTheme
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player/youtube';

import { useTutorial } from '../../../../store/provider';
import Analytics from '../../../../utils/analytics';
import logger from '../../../../utils/logger';

export interface CustomPlayerProps {
  url: string;
}

const CustomPlayer = ({ url }: CustomPlayerProps) => {
  const [isLoading, setIsLoading] = useState(true);

  const loadingComponent = () => {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: '4rem'
        }}
      >
        <CircularProgress color="secondary" />
      </div>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      {isLoading && loadingComponent()}
      <ReactPlayer
        style={{ opacity: isLoading ? '0' : '1' }}
        width="100%"
        url={url}
        onReady={() => setIsLoading(false)}
      />
    </div>
  );
};

CustomPlayer.propTypes = {
  url: PropTypes.string.isRequired
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      background: theme.palette.primary.main,
      borderBottom: `1px solid ${theme.palette.primary.light}`
    },
    tab: {
      color: theme.palette.text.primary,
      textTransform: 'none'
    },
    loaderContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: '4rem'
    }
  })
);

const Index = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { tutorials, isLoading, isFetched, getAll, errorMsg } = useTutorial();

  useEffect(() => {
    Analytics.Instance.screenView(Analytics.ScreenViews.TUTORIAL);
    logger.info('In tutorial screen');
    if (!isFetched) {
      getAll();
    }
  }, []);

  const getMainContent = () => {
    if (tutorials.length === 0) {
      return (
        <Grid container>
          <Grid item xs={12}>
            <div className={classes.loaderContainer}>
              <Typography variant="subtitle1" color="textSecondary">
                No Tutorials found.
              </Typography>
            </div>
          </Grid>
        </Grid>
      );
    }

    return (
      <Grid container>
        {tutorials.map(tutorial => (
          <Grid key={tutorial._id} item xs={6}>
            <div style={{ padding: '20px' }}>
              <CustomPlayer url={tutorial.link} />
            </div>
          </Grid>
        ))}
      </Grid>
    );
  };

  const getContent = () => {
    if (isLoading)
      return (
        <Grid container>
          <Grid item xs={12}>
            <div className={classes.loaderContainer}>
              <CircularProgress color="secondary" />
            </div>
          </Grid>
        </Grid>
      );

    return getMainContent();
  };

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography
          variant="h2"
          style={{ color: theme.palette.secondary.dark }}
          gutterBottom
        >
          Tutorial
        </Typography>
      </Grid>
      <Grid item xs={12}>
        {errorMsg && (
          <Alert severity="error" variant="filled">
            {errorMsg}
          </Alert>
        )}
        {getContent()}
      </Grid>
    </Grid>
  );
};

export default Index;
