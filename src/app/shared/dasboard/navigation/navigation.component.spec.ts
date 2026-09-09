import { NavigationComponent } from './navigation.component';

describe('NavigationComponent responsive layout contract', () => {
  const styles = ((NavigationComponent as any).ɵcmp.styles as string[]).join(' ')
    .replace(/\s+/g, ' ');

  it('uses the whole viewport and removes the desktop sidebar track on mobile', () => {
    expect(styles).toContain('width:100vw');
    expect(styles).toContain('grid-template-columns:minmax(0, 1fr)');
    expect(styles).toContain('max-width:100vw');
  });

  it('keeps the mobile sidebar as an overlay without reserving content width', () => {
    expect(styles).toContain('position:fixed');
    expect(styles).toContain('transform:translateX(-100%)');
    expect(styles).toContain('overflow-x:hidden');
  });
});
