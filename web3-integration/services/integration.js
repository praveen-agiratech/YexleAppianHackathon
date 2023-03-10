const ethers = require('ethers');
const userABI = require('./abi/user.json');
const regABI = require('./abi/registration.json');

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
const WEB3_PROVIDER = process.env.WEB3_PROVIDER;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const USER_CONTRACT = process.env.USER_CONTRACT;
const REG_CONTRACT = process.env.REG_CONTRACT;

const isAddress = function(address) {
  return ethers.utils.isAddress(address)
}

// contracts initiation
const initiateUserContract = function() {
  const provider = new ethers.providers.JsonRpcProvider(WEB3_PROVIDER);

  const userContract = new ethers.Contract(
    USER_CONTRACT,
    userABI,
    provider
  );

  let wallet = new ethers.Wallet(PRIVATE_KEY);
  let walletSigner = wallet.connect(provider);
  const userSigner = userContract.connect(walletSigner);
  return {userContract, userSigner, provider};
}

const initiateRegistrationContract = function(private_key = null) {
  const provider = new ethers.providers.JsonRpcProvider(WEB3_PROVIDER);

  const regContract = new ethers.Contract(
    REG_CONTRACT,
    regABI,
    provider
  );

  let wallet = new ethers.Wallet(private_key || PRIVATE_KEY);
  let walletSigner = wallet.connect(provider);
  const regSigner = regContract.connect(walletSigner);
  return {regContract, regSigner, provider};
}

const createAddress = function() {
  const wallet = ethers.Wallet.createRandom()
  return {
    address: wallet.address,
    private_key: wallet.privateKey,
    phrase: wallet.mnemonic.phrase
  }
}

// write actions with the flow
const whitelistUserApproverL1 = async (l1Address) => {
  if (isAddress(l1Address)) {
    let { userSigner, provider } = initiateUserContract();
    return userSigner.whitelistApproverL1(l1Address, {
      gasLimit: ethers.utils.hexlify(1000000),
      gasPrice: ethers.utils.hexlify(parseInt(await provider.getGasPrice()) * 2)
    })
    .then(transaction => {
      return provider.waitForTransaction(transaction.hash);
    })
    .then(receipt => {
      return receipt;
    })
    .catch(err => {
      console.log(err);
      return err;
    })
  } else {
    return new Error('Invalid address')
  }
}

const addUser = async (addressDetails) => {
  if (isAddress(addressDetails._l1) && isAddress(addressDetails._ad)) {
    let { userSigner, provider } = initiateUserContract();
    return userSigner.addUser(addressDetails, {
      gasLimit: ethers.utils.hexlify(1000000),
    })
    .then(transaction => {
      return provider.waitForTransaction(transaction.hash);
    })
    .then(receipt => {
      return receipt;
    })
    .catch(err => {return err;})
  } else {
    return new Error('Invalid address')
  }
}

const addUserBulk = async (l1, addresses) => {
  let { userSigner, provider } = initiateUserContract();
  return userSigner.addUserBulk1(l1, addresses, {
    gasLimit: ethers.utils.hexlify(1000000),
  })
  .then(transaction => {
    return provider.waitForTransaction(transaction.hash);
  })
  .then(receipt => {
    return receipt;
  })
  .catch(err => {return err;})
}

const whitelistApproverL1 = async (l1Address) => {
  if (isAddress(l1Address)) {
    let {regSigner, provider} = initiateRegistrationContract();
    return regSigner.whitelistApproverL1(l1Address, {
      gasLimit: ethers.utils.hexlify(1000000),
      gasPrice: ethers.utils.hexlify(parseInt(await provider.getGasPrice()) * 2)
    })
    .then(transaction => {
      return provider.waitForTransaction(transaction.hash);
    })
    .then(receipt => {
      return receipt;
    })
    .catch(err => {
      console.log(err);
      return err;
    })
  } else {
    return new Error('Invalid address')
  }
}

const whitelistApproverL2 = async (l1Address) => {
  if (isAddress(l1Address)) {
    let {regSigner, provider} = initiateRegistrationContract();
    return regSigner.whitelistApproverL2(l1Address, {
      gasLimit: ethers.utils.hexlify(1000000),
      gasPrice: ethers.utils.hexlify(parseInt(await provider.getGasPrice()) * 2)
    })
    .then(transaction => {
      return provider.waitForTransaction(transaction.hash);
    })
    .then(receipt => {
      return receipt;
    })
    .catch(err => {
      console.log(err);
      return err;
    })
  } else {
    return new Error('Invalid address')
  }
}

const mint = async (_l1, _to, land_id, token_ipfs_hash) => {
  let {regSigner, provider} = initiateRegistrationContract();
  return regSigner.mint(_l1, _to, land_id, token_ipfs_hash, {
    gasLimit: ethers.utils.hexlify(1000000),
  })
  .then(transaction => {
    return provider.waitForTransaction(transaction.hash);
  })
  .then(receipt => {
    return receipt;
  })
  .catch(err => {return err;})
}

const setTokenURI = async (land_id, token_ipfs_hash, owner) => {
  try {
    let {regSigner, provider} = initiateRegistrationContract(owner.private_key);
    return transferFee(owner.public_key)
    .then(() => {
      return regSigner.setTokenURI(land_id, token_ipfs_hash, {
        gasLimit: ethers.utils.hexlify(1000000),
      })
    })
    .then(transaction => {
      return provider.waitForTransaction(transaction.hash);
    })
    .then(receipt => {
      console.log("approve: ", receipt.status, receipt.transactionHash);
      return receipt;
    })
    .catch(err => {return err;})
  } catch(err) {
    console.log(err);
    return err;
  }
}

const landDocumentViewRequestApprove = async (_l1, _requestor, land_id, status) => {
  let {regSigner, provider} = initiateRegistrationContract();
  return regSigner.landDocumentViewRequestApprove(_l1, _requestor, land_id, status, {
    gasLimit: ethers.utils.hexlify(1000000),
  })
  .then(transaction => {
    return provider.waitForTransaction(transaction.hash);
  })
  .then(receipt => {
    return receipt;
  })
  .catch(err => {return err;})
}

const viewDocumentByRequesters = async (_requestor, land_id) => {
  let {regContract} = initiateRegistrationContract();
   let land  = await regContract.viewDocumentByRequesters(_requestor, land_id);
   return land;
}

const requestLandForSale = async (_requestor, land_id) => {
  let {regSigner, provider} = initiateRegistrationContract();
  return regSigner.requestLandForSale(_requestor, land_id, {
    gasLimit: ethers.utils.hexlify(1000000),
  })
  .then(transaction => {
    return provider.waitForTransaction(transaction.hash);
  })
  .then(receipt => {
    return receipt;
  })
  .catch(err => {return err;})
}

const ownerDecisionforRaisedRequest = async (owner, _requestor, land_id, status) => {
  let {regSigner, provider} = initiateRegistrationContract();
  return regSigner.ownerDecisionforRaisedRequest(owner, _requestor, land_id, status, {
    gasLimit: ethers.utils.hexlify(1000000),
  })
  .then(transaction => {
    return provider.waitForTransaction(transaction.hash);
  })
  .then(receipt => {
    return receipt;
  })
  .catch(err => {return err;})
}

const registrationForLandByBuyer = async (_requestor, land_id, docUri) => {
  let {regSigner, provider} = initiateRegistrationContract();
  return regSigner.registrationForLandByBuyer(_requestor, land_id, docUri, {
    gasLimit: ethers.utils.hexlify(1000000),
  })
  .then(transaction => {
    return provider.waitForTransaction(transaction.hash);
  })
  .then(receipt => {
    return receipt;
  })
  .catch(err => {return err;})
}

const approveByL1 = async (_l1, data) => {
  let {regSigner, provider} = initiateRegistrationContract();
  return regSigner.approveByL1(_l1, data, {
    gasLimit: ethers.utils.hexlify(1000000),
  })
  .then(transaction => {
    return provider.waitForTransaction(transaction.hash);
  })
  .then(receipt => {
    return receipt;
  })
  .catch(err => {return err;})
}

const transferFee = async (toAddress) => {
  const provider = new ethers.providers.JsonRpcProvider(WEB3_PROVIDER);

  let wallet = new ethers.Wallet(PRIVATE_KEY);
  let walletSigner = wallet.connect(provider);
  const tx = {
    from: PUBLIC_KEY,
    to: toAddress,
    value: ethers.utils.parseEther('0.001'),
    gasLimit: ethers.utils.hexlify("0x100000"), // 100000
    gasPrice: ethers.utils.hexlify(parseInt(await provider.getGasPrice())),
  };
  return walletSigner.sendTransaction(tx)
  .then((transaction) => {
    return provider.waitForTransaction(transaction.hash);
  })
  .then(receipt => {
    console.log("transfer fee: ", receipt.status, receipt.transactionHash);
    return receipt;
  })
  .catch(function(err) {
    console.log('error: ', err);
  });
}

const approve = async (land_id, owner) => {
  try {
    let {regSigner, provider} = initiateRegistrationContract(owner.private_key);
    return transferFee(owner.public_key)
    .then(() => {
      return regSigner.approve(PUBLIC_KEY, land_id, {
        gasLimit: ethers.utils.hexlify(1000000),
      })
    })
    .then(transaction => {
      return provider.waitForTransaction(transaction.hash);
    })
    .then(receipt => {
      console.log("approve: ", receipt.status, receipt.transactionHash);
      return receipt;
    })
    .catch(err => {return err;})
  } catch(err) {
    console.log(err);
    return err;
  }
}

const approveByL2 = async (_l2, data, owner) => {
  let {regSigner, provider} = initiateRegistrationContract();
  return approve(data._tokenId, owner)
  .then(() => {
    return regSigner.approveByL2(_l2, data, {
      gasLimit: ethers.utils.hexlify(1000000),
    })
  })
  .then(transaction => {
    return provider.waitForTransaction(transaction.hash);
  })
  .then(receipt => {
    return receipt;
  })
  .catch(err => {
    console.log(err)
    return err;
  })
}

// read actions
const L1ApproverAddress = async () => {
  let { userContract, provider } = initiateUserContract();
  return userContract.L1ApproverAddress()
  .then(l1 => {
    return l1;
  })
  .catch(err => {return err;})
}

const verifyUser = async (address) => {
  if (isAddress(address)) {
    let { userContract, provider } = initiateUserContract();
    return userContract.verifyUser(address)
    .then(status => {
      return status;
    })
    .catch(err => {return err;})
  } else {
    return new Error('Invalid address')
  }
}

const getAllUserAddress = async () => {
  let { userContract, provider } = initiateUserContract();
  return userContract.getAllUserAddress()
  .then(users => {
    return users;
  })
  .catch(err => {return err;})
}

const metadataUri = async () => {
  let {regContract, provider} = initiateRegistrationContract();
  return regContract.metadataUri()
  .then(uri => {
    return uri;
  })
  .catch(err => {return err;})
}

const viewDocumentByOwnerOrLevelApprovers = async (address, land_id) => {
  let {regContract, provider} = initiateRegistrationContract();
  return regContract.viewDocumentByOwnerOrLevelApprovers(address, land_id)
  .then(uri => {
    return uri;
  })
  .catch(err => {return err;})
}

const ownerOf = async (land_id) => {
  let {regContract, provider} = initiateRegistrationContract();
  return regContract.ownerOf(parseInt(land_id))
  .then(owner => {
    return owner;
  })
  .catch(err => {return err;})
}

const LandRequesterStatus = (address, land_id) => {
  let {regContract, provider} = initiateRegistrationContract();
  return regContract.LandRequesterStatus(address, land_id)
  .then(([ViewDocumentStatus, L1ApproverStatusForRequester, L2ApproverstatusForRequester, approveCountForTokenIdByApprovers]) => {
    return {
      viewDocumentStatus: ViewDocumentStatus,
      l1ApproverStatusForRequester: L1ApproverStatusForRequester,
      l2ApproverstatusForRequester: L2ApproverstatusForRequester,
      approveCountForTokenIdByApprovers: parseInt(approveCountForTokenIdByApprovers)
    };
  })
  .catch(err => {return err;})
}

const UserCounts = () => {
  let { userContract, provider } = initiateUserContract();
  return userContract.UserCounts()
  .then(users => {
    return parseInt(users);
  })
  .catch(err => {return err;})
}

const L1Approver = () => {
  let {regContract, provider} = initiateRegistrationContract();
  return regContract.L1Approver()
  .then(approver => {
    return approver;
  })
  .catch(err => {return err;})
}

const L2Approver = () => {
  let {regContract, provider} = initiateRegistrationContract();
  return regContract.L2Approver()
  .then(approver => {
    return approver;
  })
  .catch(err => {return err;})
}

const L1ApprovalCounts = () => {
  let {regContract, provider} = initiateRegistrationContract();
  return regContract.L1ApprovalCounts()
  .then(count => {
    return parseInt(count);
  })
  .catch(err => {return err;})
}

const L2ApprovalCounts = () => {
  let {regContract, provider} = initiateRegistrationContract();
  return regContract.L2ApprovalCounts()
  .then(count => {
    return parseInt(count);
  })
  .catch(err => {return err;})
}

const LandCounts = () => {
  let {regContract, provider} = initiateRegistrationContract();
  return regContract.LandCounts()
  .then(count => {
    return parseInt(count);
  })
  .catch(err => {return err;})
}

const LandRegistrationStatus = (land_id) => {
  let {regContract, provider} = initiateRegistrationContract();
  return regContract.LandRegistrationStatus(parseInt(land_id))
  .then(status => {
    return status;
  })
  .catch(err => {return err;})
}

const completedRegistrations = () => {
  let {regContract, provider} = initiateRegistrationContract();
  return regContract.completedRegistrations()
  .then(count => {
    return parseInt(count);
  })
  .catch(err => {return err;})
}

const returnAllUriForLandOwner = (address) => {
  let {regContract, provider} = initiateRegistrationContract();
  return regContract.returnAllUriForLandOwner(address)
  .then(cids => {
    return cids;
  })
  .catch(err => {return err;})
}

const noOfRequestersInfoToViewDoc = (land_id) => {
  let {regContract, provider} = initiateRegistrationContract();
  return regContract.noOfRequestersInfoToViewDoc(parseInt(land_id))
  .then(count => {
    return parseInt(count);
  })
  .catch(err => {return err;})
}

const allRequesterAddressForViewDocument = (land_id) => {
  let {regContract, provider} = initiateRegistrationContract();
  return regContract.allRequesterAddressForViewDocument(parseInt(land_id))
  .then(requesters => {
    return requesters;
  })
  .catch(err => {return err;})
}

module.exports = {
  createAddress,
  whitelistUserApproverL1,
  addUser,
  addUserBulk,
  whitelistApproverL1,
  whitelistApproverL2,
  mint,
  setTokenURI,
  landDocumentViewRequestApprove,
  viewDocumentByRequesters,
  requestLandForSale,
  ownerDecisionforRaisedRequest,
  registrationForLandByBuyer,
  approveByL1,
  approveByL2,
  L1ApproverAddress,
  verifyUser,
  getAllUserAddress,
  metadataUri,
  viewDocumentByOwnerOrLevelApprovers,
  ownerOf,
  LandRequesterStatus,
  UserCounts,
  L1Approver,
  L2Approver,
  L1ApprovalCounts,
  L2ApprovalCounts,
  LandCounts,
  LandRegistrationStatus,
  completedRegistrations,
  returnAllUriForLandOwner,
  noOfRequestersInfoToViewDoc,
  allRequesterAddressForViewDocument
}