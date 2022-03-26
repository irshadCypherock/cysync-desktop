import React, { useEffect, useState } from 'react';

import DialogBox from '../../../../designSystem/designComponents/dialog/dialogBox';
import { useConnection } from '../../../../store/provider';
import logger from '../../../../utils/logger';

import PopupComponent from './popup';

const DeviceErrorPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { verifyState } = useConnection();

  const onClose = () => {
    setIsOpen(false);
    logger.info('Initial Device error prompt closed by user');
  };

  useEffect(() => {
    // Open only when device is not ready or unknown error occured.
    const doOpen = [6, 7].includes(verifyState);
    setIsOpen(doOpen);
    if (doOpen) {
      logger.info('Initial Device error prompt open', { verifyState });
    }
  }, [verifyState]);

  if (isOpen) {
    return (
      <DialogBox
        fullWidth
        maxWidth="md"
        open={isOpen}
        handleClose={onClose}
        isClosePresent
        restComponents={
          <PopupComponent state={verifyState} handleClose={onClose} />
        }
      />
    );
  }

  return <></>;
};

export default DeviceErrorPopup;
