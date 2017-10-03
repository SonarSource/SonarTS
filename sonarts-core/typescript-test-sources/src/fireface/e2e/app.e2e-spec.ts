import { FirefacePage } from './app.po';

describe('fireface App', function() {
  let page: FirefacePage;

  beforeEach(() => {
    page = new FirefacePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
