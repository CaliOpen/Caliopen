import * as ApplicationManager from './index';

describe('Service ApplicationManager', () => {
  describe('getInfos', () => {
    it('give infos from name', () => {
      expect(ApplicationManager.getInfosFromName('discussions')).toEqual({
        name: 'discussions',
        route: 'discussions',
        icon: 'comments',
      });
    });

    it('give infos', () => {
      expect(ApplicationManager.getInfosFromName('contacts')).toEqual({
        name: 'contacts',
        route: 'contact-list',
        icon: 'users',
      });
    });
  });

  describe('getInfosFromRoute', () => {
    it('retrieves an app', () => {
      expect(ApplicationManager.getInfosFromRoute('contact-list')).toEqual({
        name: 'contacts',
        route: 'contact-list',
        icon: 'users',
      });
    });

    it('does not retrieve an app', () => {
      expect(ApplicationManager.getInfosFromRoute('contact')).toEqual(undefined);
    });
  });

  it('getApplications', () => {
    expect(ApplicationManager.getApplications().length).toEqual(2);
  });
});
