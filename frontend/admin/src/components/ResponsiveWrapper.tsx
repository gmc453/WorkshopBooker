import React from 'react';

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  mobileComponent?: React.ReactNode;
  desktopComponent?: React.ReactNode;
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl';
}

export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  mobileComponent,
  desktopComponent,
  breakpoint = 'md'
}) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      const breakpoints = {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280
      };
      setIsMobile(window.innerWidth < breakpoints[breakpoint]);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [breakpoint]);

  if (isMobile && mobileComponent) {
    return <>{mobileComponent}</>;
  }

  if (!isMobile && desktopComponent) {
    return <>{desktopComponent}</>;
  }

  return <>{children}</>;
};

export default ResponsiveWrapper; 