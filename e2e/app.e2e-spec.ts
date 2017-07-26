import { AngularLibraryPage } from './app.po';

describe('angular-library App', () => {
  let page: AngularLibraryPage;

  beforeEach(() => {
    page = new AngularLibraryPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
