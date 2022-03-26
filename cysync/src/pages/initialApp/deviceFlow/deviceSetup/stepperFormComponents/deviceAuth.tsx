import { IconButton } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ReportIcon from '@material-ui/icons/Report';
import React, { useEffect } from 'react';

import success from '../../../../../assets/icons/generic/success.png';
import CustomButton from '../../../../../designSystem/designComponents/buttons/button';
import AvatarIcon from '../../../../../designSystem/designComponents/icons/AvatarIcon';
import Icon from '../../../../../designSystem/designComponents/icons/Icon';
import ErrorExclamation from '../../../../../designSystem/iconGroups/errorExclamation';
import { useDeviceAuth } from '../../../../../store/hooks/flows';
import {
  FeedbackState,
  useConnection,
  useFeedback
} from '../../../../../store/provider';
import Analytics from '../../../../../utils/analytics';
import { hexToVersion, inTestApp } from '../../../../../utils/compareVersion';
import logger from '../../../../../utils/logger';
import DynamicTextView from '../../../../mainApp/sidebar/settings/tabViews/deviceHealth/dynamicTextView';

import {
  StepComponentProps,
  StepComponentPropTypes
} from './StepComponentProps';

const useStyles = makeStyles(() =>
  createStyles({
    middle: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '60vh',
      justifyContent: 'center',
      alignItems: 'flex-start'
    },
    success: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%'
    },
    bottomContainer: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    },
    report: {
      position: 'absolute',
      right: 20,
      bottom: 20
    },
    btnContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }
  })
);

const DeviceAuthentication: React.FC<StepComponentProps> = ({ handleNext }) => {
  const classes = useStyles();

  const {
    internalDeviceConnection: deviceConnection,
    devicePacketVersion,
    deviceSdkVersion,
    inBackgroundProcess,
    inBootloader,
    firmwareVersion,
    deviceState,
    setDeviceSerial,
    verifyState,
    setIsInFlow
  } = useConnection();
  const [errorMsg, setErrorMsg] = React.useState('');
  const [initialStart, setInitialStart] = React.useState(false);

  const {
    handleDeviceAuth,
    verified,
    resetHooks,
    completed,
    errorMessage,
    confirmed,
    setErrorMessage
  } = useDeviceAuth(true);

  const feedback = useFeedback();

  useEffect(() => {
    Analytics.Instance.event(
      Analytics.Categories.INITIAL_DEVICE_AUTH,
      Analytics.Actions.OPEN
    );
    logger.info('Initial device auth opened');

    return () => {
      Analytics.Instance.event(
        Analytics.Categories.INITIAL_DEVICE_AUTH,
        Analytics.Actions.CLOSED
      );
      logger.info('Initial device auth closed');
    };
  }, []);

  useEffect(() => {
    if (!initialStart) {
      if (
        deviceConnection &&
        !inBackgroundProcess &&
        [1, 2].includes(verifyState)
      ) {
        if (inBootloader) {
          setErrorMsg(
            'Your device is misconfigured, Please restart cySync App. If the problem persists, please contact us.'
          );
          return;
        }

        setInitialStart(true);
        if (firmwareVersion) {
          handleDeviceAuth({
            connection: deviceConnection,
            packetVersion: devicePacketVersion,
            sdkVersion: deviceSdkVersion,
            setIsInFlow,
            firmwareVersion: hexToVersion(firmwareVersion),
            setDeviceSerial,
            inTestApp: inTestApp(deviceState)
          });
        }
      }
    }
  }, [deviceConnection, inBackgroundProcess]);

  useEffect(() => {
    if (completed && verified === 2) {
      // Delay for the device upgrade
      setTimeout(() => {
        handleNext();
        resetHooks();
      }, 1500);
      Analytics.Instance.event(
        Analytics.Categories.INITIAL_DEVICE_AUTH,
        Analytics.Actions.COMPLETED
      );
    }

    if (verified === -1 || errorMessage) {
      Analytics.Instance.event(
        Analytics.Categories.INITIAL_DEVICE_AUTH,
        Analytics.Actions.ERROR
      );
    }
  }, [verified, completed]);

  const newFeedbackState: FeedbackState = {
    attachLogs: true,
    attachDeviceLogs: false,
    categories: ['Report'],
    category: 'Report',
    description: errorMsg || errorMessage,
    descriptionError: '',
    email: '',
    emailError: '',
    subject: 'Reporting for Error (Device Authentication)',
    subjectError: ''
  };

  const handleFeedbackOpen = () => {
    feedback.showFeedback({
      isContact: true,
      heading: 'Report',
      initFeedbackState: newFeedbackState
    });
  };

  let timeout: NodeJS.Timeout | undefined;
  const onRetry = () => {
    setErrorMsg('');
    setErrorMessage('');
    resetHooks();

    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }

    if (verifyState !== 1) {
      setErrorMsg('Please connect the device and try again.');
      return;
    }

    timeout = setTimeout(() => {
      if (deviceConnection && firmwareVersion) {
        handleDeviceAuth({
          connection: deviceConnection,
          packetVersion: devicePacketVersion,
          sdkVersion: deviceSdkVersion,
          setIsInFlow,
          firmwareVersion: hexToVersion(firmwareVersion),
          setDeviceSerial,
          inTestApp: inTestApp(deviceState)
        });
      }
    }, 1000);
  };

  return (
    <Grid container>
      <Grid item xs={3} />
      <Grid item xs={6} className={classes.middle}>
        <Typography
          color="textSecondary"
          gutterBottom
          style={{ marginBottom: '1rem' }}
        >
          Follow the Steps on Device
        </Typography>
        <DynamicTextView
          text="Connect X1 wallet"
          state={verifyState === 1 ? 2 : 1}
        />
        <br />
        <DynamicTextView
          text="Authenticating Device"
          state={errorMessage || errorMsg ? -1 : confirmed === 1 ? 1 : verified}
        />
        <br />
        {verified === 2 && (
          <div className={classes.success}>
            <AvatarIcon alt="success" src={success} size="small" />
            <Typography variant="body2" color="secondary">
              Device was verified successfully
            </Typography>
          </div>
        )}
        {(verified === -1 || errorMessage || errorMsg) && (
          <div className={classes.bottomContainer}>
            <div className={classes.success}>
              <Icon
                size={50}
                viewBox="0 0 60 60"
                iconGroup={<ErrorExclamation />}
              />
              <Typography variant="body2" color="secondary">
                {errorMessage || errorMsg || 'Device Authenticating failed'}
              </Typography>
            </div>
            <div className={classes.btnContainer}>
              {verified !== -1 && (
                <CustomButton
                  onClick={() => {
                    onRetry();
                  }}
                  style={{ margin: '1rem 10px 1rem 0' }}
                >
                  Retry
                </CustomButton>
              )}
              <CustomButton
                onClick={() => {
                  feedback.showFeedback({ isContact: true });
                }}
                style={{ margin: '1rem 0rem' }}
              >
                Contact Us
              </CustomButton>
            </div>
          </div>
        )}
      </Grid>
      <Grid item xs={3} />
      <IconButton
        title="Report issue"
        onClick={handleFeedbackOpen}
        className={classes.report}
      >
        <ReportIcon color="secondary" />
      </IconButton>
    </Grid>
  );
};

DeviceAuthentication.propTypes = StepComponentPropTypes;

export default DeviceAuthentication;
