import * as ApplicationManager from './index';

describe('Service ApplicationManager', () => {
  describe('getInfos', () => {
    it('give infos from name [discussions]', () => {
      expect(ApplicationManager.getInfosFromName('discussions').name).toEqual(
        'discussions'
      );
      expect(ApplicationManager.getInfosFromName('discussions').route).toEqual(
        '/'
      );
    });

    it('give infos [contacts]', () => {
      expect(ApplicationManager.getInfosFromName('contacts').name).toEqual(
        'contacts'
      );
      expect(ApplicationManager.getInfosFromName('contacts').route).toEqual(
        '/contacts'
      );
    });
  });

  describe('getInfosFromRoute', () => {
    it('retrieves an app', () => {
      expect(ApplicationManager.getInfosFromRoute('/contacts').name).toEqual(
        'contacts'
      );
      expect(ApplicationManager.getInfosFromRoute('/contacts').route).toEqual(
        '/contacts'
      );
    });

    it('does not retrieve an app', () => {
      expect(ApplicationManager.getInfosFromRoute('/contact')).toEqual(
        undefined
      );
    });
  });

  it('getApplications', () => {
    expect(ApplicationManager.getApplications().length).toEqual(2);
  });
});
