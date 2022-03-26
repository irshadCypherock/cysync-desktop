import { Theme, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Styles } from '@material-ui/styles';
import React from 'react';

import Icon from '../designSystem/designComponents/icons/Icon';
import ErrorExclamation from '../designSystem/iconGroups/errorExclamation';
import logger from '../utils/logger';

const useStyles: Styles<Theme, {}, string> = () => ({
  root: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '400px',
    height: 'auto',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});

/**
 * This is used to show a minimal UI if the Feedback component has some error.
 *
 * Note: Not being used now, since the error thrown will be captured by the
 * window.onerror method and sent to the main process. Where the user can send
 * the crash report.
 */
class FeedbackErrorBoundary extends React.Component<
  { classes?: any },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: any, errorInfo: any) {
    this.setState({ hasError: true });
    logger.error(error, errorInfo);
  }

  render() {
    const { hasError } = this.state;
    const { children, classes } = this.props;

    if (hasError) {
      return (
        <div className={classes.root}>
          <Icon
            size={55}
            viewBox="0 0 55 55"
            iconGroup={<ErrorExclamation />}
          />
          <Typography
            color="textPrimary"
            variant="h2"
            gutterBottom
            style={{ margin: '30px 0px' }}
          >
            Oops
          </Typography>
          <Typography color="textPrimary" gutterBottom align="center">
            Something went wrong,
            <br />
            Please contact us at support@cypherock.com.
          </Typography>
        </div>
      );
    }

    return children;
  }
}

export default withStyles(useStyles)(FeedbackErrorBoundary);
