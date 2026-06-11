// src/components/Accounts/AccountPageHeader.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faWallet } from "@fortawesome/free-solid-svg-icons";
import ExtendedHeaderCard from "../Common/ExtendedHeaderCard";
import Button from "../Common/Button";

const AccountPageHeader = ({ onAddAccountClick }) => {
  return (
    <ExtendedHeaderCard
      title="Quản Lý Nguồn Tiền"
      extra={
        <FontAwesomeIcon icon={faWallet} />
      }
      action={
        <Button
          onClick={onAddAccountClick}
          icon={<FontAwesomeIcon icon={faPlus} />}
          variant="secondary"
        >
          Thêm Nguồn Tiền
        </Button>
      }
    />
  );
};

export default AccountPageHeader;
