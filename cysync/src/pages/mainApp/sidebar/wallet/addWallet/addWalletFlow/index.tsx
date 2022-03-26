import PropTypes from 'prop-types';
import React from 'react';

import DialogBox from '../../../../../../designSystem/designComponents/dialog/dialogBox';

import AddWalletForm from './addWalletForm';

interface AddWalletFlowProps {
  open: boolean;
  handleClose: (
    abort?: boolean | undefined,
    openAddCoinForm?: boolean | undefined
  ) => void;
  walletName?: string;
  walletSuccess: boolean;
}

const Index: React.FC<AddWalletFlowProps> = ({
  open,
  handleClose,
  walletName,
  walletSuccess
}) => {
  return (
    <DialogBox
      fullWidth
      maxWidth="sm"
      open={open}
      handleClose={() => handleClose(true)}
      dialogHeading="Import Wallet"
      disableBackdropClick
      isClosePresent
      restComponents={
        <AddWalletForm
          handleClose={handleClose}
          walletName={walletName}
          walletSuccess={walletSuccess}
        />
      }
    />
  );
};

Index.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  walletName: PropTypes.string,
  walletSuccess: PropTypes.bool.isRequired
};

Index.defaultProps = {
  walletName: undefined
};

export default Index;
