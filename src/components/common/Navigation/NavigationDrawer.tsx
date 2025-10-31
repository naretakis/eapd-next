'use client';

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
  Collapse,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
  Code as CodeIcon,
  Storage as StorageIcon,
  Transform as TransformIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface NavigationDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Navigation Drawer Component
 *
 * Provides the main navigation menu with:
 * - Dashboard navigation
 * - Demo pages section with expandable submenu
 * - Consistent Material-UI styling
 * - Responsive behavior
 */
export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  open,
  onClose,
}) => {
  const router = useRouter();
  const [demoExpanded, setDemoExpanded] = React.useState(false);

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleDemoToggle = () => {
    setDemoExpanded(!demoExpanded);
  };

  const navigationItems = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
      description: 'APD Management Dashboard',
    },
  ];

  const demoItems = [
    {
      label: 'Milkdown Editor',
      icon: <EditIcon />,
      path: '/demo/milkdown-demo',
      description: 'Rich text editor demo',
    },
    {
      label: 'PAPD Form',
      icon: <DescriptionIcon />,
      path: '/demo/papd-form-demo',
      description: 'Complete form demo',
    },
    {
      label: 'Template Parser',
      icon: <TransformIcon />,
      path: '/demo/template-parser-demo',
      description: 'Template parsing demo',
    },
    {
      label: 'Storage Layer',
      icon: <StorageIcon />,
      path: '/demo/storage-demo',
      description: 'Storage operations demo',
    },
  ];

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          eAPD-Next
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Navigation Menu
        </Typography>
      </Box>

      <Divider />

      <List>
        {/* Main Navigation Items */}
        {navigationItems.map(item => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton onClick={() => handleNavigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} secondary={item.description} />
            </ListItemButton>
          </ListItem>
        ))}

        <Divider sx={{ my: 1 }} />

        {/* Demo Pages Section */}
        <ListItem disablePadding>
          <ListItemButton onClick={handleDemoToggle}>
            <ListItemIcon>
              <CodeIcon />
            </ListItemIcon>
            <ListItemText
              primary="Demo Pages"
              secondary="Development demonstrations"
            />
            {demoExpanded ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>

        <Collapse in={demoExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {demoItems.map(item => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  sx={{ pl: 4 }}
                  onClick={() => handleNavigate(item.path)}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    secondary={item.description}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>

      <Box sx={{ mt: 'auto', p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          eAPD-Next v{process.env.NEXT_PUBLIC_VERSION || '0.4.0'}
        </Typography>
        {process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production' && (
          <Typography variant="caption" color="warning.main" display="block">
            {process.env.NEXT_PUBLIC_ENVIRONMENT?.toUpperCase() || 'DEV'}{' '}
            Environment
          </Typography>
        )}
      </Box>
    </Drawer>
  );
};

export default NavigationDrawer;
