import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  Divider,
  Container,
  Avatar,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Category as CategoryIcon,
  Notifications as NotificationsIcon,
  
  Home as HomeIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const drawerWidth = 260;

const AdminLayout = () => {
  const [open, setOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isSmallScreen = useMediaQuery('(max-width:1200px)');

  // Automatically close drawer on small screens
  useEffect(() => {
    if (isSmallScreen) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [isSmallScreen]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#6366f1' }, // Matching site's primary color
      secondary: { main: '#a855f7' }, // Purple from gradient
      background: {
        default: darkMode ? '#121212' : '#f8fafc',
        paper: darkMode ? '#1e1e1e' : '#ffffff'
      }
    },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif'
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            backgroundImage: darkMode 
              ? 'linear-gradient(to right, #0f172a, #1e293b)'
              : 'linear-gradient(to right, #6366f1, #a855f7)'
          }
        }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: darkMode ? '#121212' : '#ffffff',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)'
          }
        }
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            margin: '4px 8px',
            '&.Mui-selected': {
              backgroundImage: 'linear-gradient(to right, #6366f1, #a855f7)',
            }
          }
        }
      }
    }
  });

  const menuItems = [
    { text: 'Trang chủ Admin', icon: <HomeIcon />, path: '/admin' },
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Người dùng', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Khóa học', icon: <SchoolIcon />, path: '/admin/courses' },
    { text: 'Danh mục', icon: <CategoryIcon />, path: '/admin/categories' },
    { text: 'Sản phẩm', icon: <ShoppingCartIcon />, path: '/admin/products' },
    { text: 'Đơn hàng', icon: <ReceiptIcon />, path: '/admin/orders' },
    { text: 'Cài đặt', icon: <SettingsIcon />, path: '/admin/settings' }
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar
          position="fixed"
          sx={{
            zIndex: theme.zIndex.drawer + 1,
            transition: theme.transitions.create(['width', 'margin'], { 
              easing: theme.transitions.easing.sharp, 
              duration: theme.transitions.duration.leavingScreen 
            }),
            ...(open && {
              marginLeft: drawerWidth,
              width: `calc(100% - ${drawerWidth}px)`,
              transition: theme.transitions.create(['width', 'margin'], { 
                easing: theme.transitions.easing.sharp, 
                duration: theme.transitions.duration.enteringScreen 
              })
            })
          }}
        >
          <Toolbar>
            <IconButton 
              color="inherit" 
              edge="start" 
              onClick={() => setOpen(!open)} 
              sx={{ mr: 2 }}
            >
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
            <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 600 }}>
              LuanAcademy Admin
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton color="inherit" onClick={() => navigate('/')}>
                <HomeIcon />
              </IconButton>
              
              <Badge badgeContent={3} color="error">
                <IconButton color="inherit">
                  <NotificationsIcon />
                </IconButton>
              </Badge>
              
              <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              
              <IconButton color="inherit" sx={{ ml: 1 }}>
                <Avatar 
                  sx={{ 
                    width: 34, 
                    height: 34, 
                    bgcolor: 'background.paper',
                    color: 'primary.main',
                    fontWeight: 'bold'
                  }}
                >
                  A
                </Avatar>
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="permanent"
          open={open}
          sx={{
            width: open ? drawerWidth : theme.spacing(9),
            transition: theme.transitions.create('width', { 
              easing: theme.transitions.easing.sharp, 
              duration: theme.transitions.duration.enteringScreen 
            }),
            '& .MuiDrawer-paper': {
              width: open ? drawerWidth : theme.spacing(9),
              transition: theme.transitions.create('width', { 
                easing: theme.transitions.easing.sharp, 
                duration: theme.transitions.duration.enteringScreen 
              }),
              overflowX: 'hidden',
              border: 'none'
            }
          }}
        >
          <Toolbar>
            <Box 
              sx={{ 
                width: '100%', 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                py: 1
              }}
            >
              {open && (
                <Typography 
                  variant="h6" 
                  sx={{ 
                    background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    fontWeight: 700
                  }}
                >
                  Admin Panel
                </Typography>
              )}
            </Box>
          </Toolbar>
          <Divider />
          
          <Box sx={{ px: 2, pt: 2, pb: 2 }}>
            {open && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'primary.main',
                      width: 40,
                      height: 40
                    }}
                  >
                    A
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Admin User
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Quản trị viên
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
            
            <Typography 
              variant="overline" 
              sx={{ 
                pl: 1, 
                opacity: open ? 1 : 0,
                color: 'text.secondary',
                fontWeight: 600
              }}
            >
              Quản lý
            </Typography>
          </Box>
          
          <List sx={{ px: 1 }}>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  mb: 0.5,
                  '&.Mui-selected': {
                    color: 'white',
                    '&:hover': { 
                      bgcolor: 'rgba(99, 102, 241, 0.8)' 
                    }
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: location.pathname === item.path ? 'white' : 'inherit'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    opacity: open ? 1 : 0,
                    '& .MuiTypography-root': {
                      fontWeight: 500
                    }
                  }} 
                />
              </ListItem>
            ))}
          </List>
        </Drawer>

        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            pb: 12, // Add extra padding to bottom to prevent overlap with footer
            pt: 3, 
            px: 3,
            mt: 8, 
            backgroundColor: theme.palette.background.default,
            minHeight: 'calc(100vh - 60px)', // Subtract footer height
            maxWidth: '100%',
            overflow: 'hidden'
          }}
        >
          <Container maxWidth="xl">
            <Outlet />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminLayout;