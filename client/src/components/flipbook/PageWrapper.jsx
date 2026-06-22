import { forwardRef } from 'react';

const PageWrapper = forwardRef(({ children }, ref) => (
  <div className="flip-page" ref={ref}>
    {children}
  </div>
));

export default PageWrapper;
