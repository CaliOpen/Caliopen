import * as module from '../modules/openpgp-keychain';
import getPGPManager from '../../services/openpgp-manager';
import * as openPGPKeychainRepository from '../../services/openpgp-keychain-repository';

export default store => next => (action) => {
  const result = next(action);

  if (action.type === module.FETCH_ALL) {
    store.dispatch(module.receiveAll({
      keychainByFingerprint: openPGPKeychainRepository.getPrimaryKeysByFingerprint(),
    }));
  }

  if (action.type === module.GENERATE) {
    const { name, email, passphrase } = action.payload;
    getPGPManager().then(({ generateKey }) => generateKey(name, email, passphrase))
      .then((generated) => {
        const { fingerprint } = generated.key.primaryKey;
        const { publicKeyArmored, privateKeyArmored } = generated;
        store.dispatch(module.generationSucceed({
          fingerprint, publicKeyArmored, privateKeyArmored,
        }));
      });
  }

  if (action.type === module.IMPORT_PUBLIC_KEY) {
    const { publicKeyArmored } = action.payload;
    getPGPManager().then(({ validatePublicKeyChain }) => validatePublicKeyChain(publicKeyArmored))
      .then(({ key }) => {
        const { fingerprint } = key.primaryKey;
        store.dispatch(module.importKeyChainSucceed({
          fingerprint,
          publicKeyArmored,
        }));
      }).catch((errors) => {
        store.dispatch(module.importKeyChainFailed({ errors }));
      });
  }

  if (action.type === module.IMPORT_KEY_PAIR) {
    const { publicKeyArmored, privateKeyArmored } = action.payload;

    getPGPManager()
      .then(({ validateKeyChainPair }) => validateKeyChainPair(publicKeyArmored, privateKeyArmored))
      .then(({ key }) => {
        const { fingerprint } = key.primaryKey;
        store.dispatch(module.importKeyChainSucceed({
          fingerprint,
          publicKeyArmored,
          privateKeyArmored,
        }));
      }).catch((errors) => {
        store.dispatch(module.importKeyChainFailed(errors));
      });
  }

  const actionsRequireSave = [module.GENERATION_SUCCEED, module.IMPORT_SUCCEED];
  if (actionsRequireSave.indexOf(action.type) !== -1) {
    const { fingerprint, publicKeyArmored, privateKeyArmored } = action.payload;
    store.dispatch(module.save({ fingerprint, publicKeyArmored, privateKeyArmored }));
  }

  if (action.type === module.SAVE) {
    const { fingerprint, publicKeyArmored, privateKeyArmored } = action.payload;
    openPGPKeychainRepository.saveKey(fingerprint, publicKeyArmored, privateKeyArmored);
    store.dispatch(module.fetchAll());
  }

  if (action.type === module.DELETE) {
    const { fingerprint } = action.payload;
    openPGPKeychainRepository.deleteKey(fingerprint);
    store.dispatch(module.fetchAll());
  }

  return result;
};
