import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import Icon from '../../../../../../designSystem/designComponents/icons/Icon';
import ICONS from '../../../../../../designSystem/iconGroups/iconConstants';

const CustomPaper = styled(Paper)`
  position: relative;
  width: 90%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background: rgba(66, 66, 66, 0.5);
  padding: 10px 30px;
  margin: 15px 0px;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    background: rgba(66, 66, 66, 0.3);
  }
`;

type ToggleProps = {
  text: string;
  completed: boolean;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    text: {
      color: completed => (completed ? 'blue' : theme.palette.primary.light)
    },
    arrow: {
      marginRight: '0.5rem'
    },
    checkmark: {
      position: 'absolute',
      right: '1rem',
      transition: 'all 0.3s ease'
    }
  })
);

const ToggleButton: React.FC<ToggleProps> = ({ text, completed }) => {
  const classes = useStyles(completed);
  return (
    <CustomPaper variant="outlined" elevation={0}>
      <Icon
        className={classes.arrow}
        icon={ICONS.chevronRight}
        viewBox="0 0 31.49 31.49"
        size={14}
        color="orange"
      />
      <Typography variant="body1" className={classes.text}>
        {text}
      </Typography>
      {completed ? (
        <Icon
          className={classes.checkmark}
          icon={ICONS.checkmark}
          viewBox="0 0 479 479"
          color="grey"
        />
      ) : null}
    </CustomPaper>
  );
};

ToggleButton.propTypes = {
  text: PropTypes.string.isRequired,
  completed: PropTypes.bool.isRequired
};

export default ToggleButton;
