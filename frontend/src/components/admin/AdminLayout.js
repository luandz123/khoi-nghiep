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
  Badge,
  Collapse,
  ListItemButton
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
  Settings as SettingsIcon,
  Add as AddIcon,
  List as ListIcon,
  Book as BookIcon,
  LibraryBooks as LibraryBooksIcon,
  MenuBook as MenuBookIcon,
  QuestionAnswer as QuestionAnswerIcon,
  ExpandLess,
  ExpandMore,
  VideoLibrary as VideoIcon,
  Assessment as AssessmentIcon,
  Star as StarIcon
} from '@mui/icons-material';

const drawerWidth = 260;

const AdminLayout = () => {
  const [open, setOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isSmallScreen = useMediaQuery('(max-width:1200px)');
  
  // State for submenu open/close
  const [openCourseMenu, setOpenCourseMenu] = useState(false);
  const [openProductMenu, setOpenProductMenu] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openReportMenu, setOpenReportMenu] = useState(false);

  // Automatically close drawer on small screens
  useEffect(() => {
    if (isSmallScreen) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [isSmallScreen]);

  // Automatically open submenu based on current route
  useEffect(() => {
    if (location.pathname.includes('/admin/courses') || 
        location.pathname.includes('/admin/chapters') || 
        location.pathname.includes('/admin/lessons')) {
      setOpenCourseMenu(true);
    }
    
    if (location.pathname.includes('/admin/products')) {
      setOpenProductMenu(true);
    }
    
    if (location.pathname.includes('/admin/users')) {
      setOpenUserMenu(true);
    }
    
    if (location.pathname.includes('/admin/reports')) {
      setOpenReportMenu(true);
    }
  }, [location.pathname]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#6366f1' },
      secondary: { main: '#a855f7' },
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

  // Check if menu item is active
  const isMenuActive = (path) => {
    return location.pathname === path;
  };

  // Check if submenu items should be active
  const isSubmenuActive = (paths) => {
    return paths.some(path => location.pathname.includes(path));
  };

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
            {/* Dashboard */}
            <ListItem
              button
              onClick={() => navigate('/admin/dashboard')}
              selected={isMenuActive('/admin/dashboard')}
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
                  color: isMenuActive('/admin/dashboard') ? 'white' : 'inherit'
                }}
              >
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Dashboard" 
                sx={{ 
                  opacity: open ? 1 : 0,
                  '& .MuiTypography-root': {
                    fontWeight: 500
                  }
                }} 
              />
            </ListItem>

            {/* Courses Management with nested menu */}
            <ListItem
              button
              onClick={() => setOpenCourseMenu(!openCourseMenu)}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                mb: 0.5,
                bgcolor: isSubmenuActive(['/admin/courses', '/admin/chapters', '/admin/lessons']) && !isMenuActive('/admin/dashboard') ? 
                  'rgba(99, 102, 241, 0.1)' : 'transparent',
                borderRadius: '8px',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: isSubmenuActive(['/admin/courses', '/admin/chapters', '/admin/lessons']) ? 
                    'primary.main' : 'inherit'
                }}
              >
                <SchoolIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Quản lý khóa học" 
                sx={{ 
                  opacity: open ? 1 : 0,
                  '& .MuiTypography-root': {
                    fontWeight: 500
                  }
                }} 
              />
              {open && (openCourseMenu ? <ExpandLess /> : <ExpandMore />)}
            </ListItem>

            {/* Course submenu */}
            <Collapse in={openCourseMenu && open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton
                  sx={{ pl: 4, borderRadius: '8px', mx: 1, mb: 0.5 }}
                  selected={isMenuActive('/admin/courses')}
                  onClick={() => navigate('/admin/courses')}
                >
                  <ListItemIcon sx={{ minWidth: 35 }}>
                    <ListIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Danh sách khóa học" />
                </ListItemButton>
                
                <ListItemButton
                  sx={{ pl: 4, borderRadius: '8px', mx: 1, mb: 0.5 }}
                  selected={isMenuActive('/admin/add-course')}
                  onClick={() => navigate('/admin/add-course')}
                >
                  <ListItemIcon sx={{ minWidth: 35 }}>
                    <AddIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Thêm khóa học mới" />
                </ListItemButton>
                
                <ListItemButton
                  sx={{ pl: 4, borderRadius: '8px', mx: 1, mb: 0.5 }}
                  selected={isMenuActive('/admin/manage-courses')}
                  onClick={() => navigate('/admin/manage-courses')}
                >
                  <ListItemIcon sx={{ minWidth: 35 }}>
                    <BookIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Quản lý nội dung" />
                </ListItemButton>
                
                <ListItemButton
                  sx={{ pl: 4, borderRadius: '8px', mx: 1, mb: 0.5 }}
                  selected={location.pathname.includes('/admin/chapters')}
                  onClick={() => navigate('/admin/chapters/0')}
                >
                  <ListItemIcon sx={{ minWidth: 35 }}>
                    <LibraryBooksIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Quản lý chương" />
                </ListItemButton>
                
                <ListItemButton
                  sx={{ pl: 4, borderRadius: '8px', mx: 1, mb: 0.5 }}
                  selected={location.pathname.includes('/admin/lessons')}
                  onClick={() => navigate('/admin/lessons/0')}
                >
                  <ListItemIcon sx={{ minWidth: 35 }}>
                    <MenuBookIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Quản lý bài học" />
                </ListItemButton>
                
                <ListItemButton
                  sx={{ pl: 4, borderRadius: '8px', mx: 1, mb: 0.5 }}
                  selected={location.pathname.includes('/admin/quizzes')}
                  onClick={() => navigate('/admin/quizzes')}
                >
                  <ListItemIcon sx={{ minWidth: 35 }}>
                    <QuestionAnswerIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Quản lý quiz" />
                </ListItemButton>
              </List>
            </Collapse>

            {/* User Management */}
            <ListItem
              button
              onClick={() => setOpenUserMenu(!openUserMenu)}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                mb: 0.5,
                bgcolor: isSubmenuActive(['/admin/users']) && !isMenuActive('/admin/dashboard') ? 
                  'rgba(99, 102, 241, 0.1)' : 'transparent',
                borderRadius: '8px',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: isSubmenuActive(['/admin/users']) ? 'primary.main' : 'inherit'
                }}
              >
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Quản lý người dùng" 
                sx={{ 
                  opacity: open ? 1 : 0,
                  '& .MuiTypography-root': {
                    fontWeight: 500
                  }
                }} 
              />
              {open && (openUserMenu ? <ExpandLess /> : <ExpandMore />)}
            </ListItem>

            {/* User submenu */}
            <Collapse in={openUserMenu && open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton
                  sx={{ pl: 4, borderRadius: '8px', mx: 1, mb: 0.5 }}
                  selected={isMenuActive('/admin/users')}
                  onClick={() => navigate('/admin/users')}
                >
                  <ListItemIcon sx={{ minWidth: 35 }}>
                    <ListIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Danh sách người dùng" />
                </ListItemButton>
                
                <ListItemButton
                  sx={{ pl: 4, borderRadius: '8px', mx: 1, mb: 0.5 }}
                  selected={isMenuActive('/admin/users/roles')}
                  onClick={() => navigate('/admin/users/roles')}
                >
                  <ListItemIcon sx={{ minWidth: 35 }}>
                    <PeopleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Phân quyền" />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Category */}
            <ListItem
              button
              onClick={() => navigate('/admin/categories')}
              selected={isMenuActive('/admin/categories')}
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
                  color: isMenuActive('/admin/categories') ? 'white' : 'inherit'
                }}
              >
                <CategoryIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Danh mục" 
                sx={{ 
                  opacity: open ? 1 : 0,
                  '& .MuiTypography-root': {
                    fontWeight: 500
                  }
                }} 
              />
            </ListItem>

            {/* Products */}
            <ListItem
              button
              onClick={() => setOpenProductMenu(!openProductMenu)}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                mb: 0.5,
                bgcolor: isSubmenuActive(['/admin/products']) && !isMenuActive('/admin/dashboard') ? 
                  'rgba(99, 102, 241, 0.1)' : 'transparent',
                borderRadius: '8px',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: isSubmenuActive(['/admin/products']) ? 'primary.main' : 'inherit'
                }}
              >
                <ShoppingCartIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Sản phẩm" 
                sx={{ 
                  opacity: open ? 1 : 0,
                  '& .MuiTypography-root': {
                    fontWeight: 500
                  }
                }} 
              />
              {open && (openProductMenu ? <ExpandLess /> : <ExpandMore />)}
            </ListItem>

            {/* Products submenu */}
            <Collapse in={openProductMenu && open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton
                  sx={{ pl: 4, borderRadius: '8px', mx: 1, mb: 0.5 }}
                  selected={isMenuActive('/admin/products')}
                  onClick={() => navigate('/admin/products')}
                >
                  <ListItemIcon sx={{ minWidth: 35 }}>
                    <ListIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Danh sách sản phẩm" />
                </ListItemButton>
                
                <ListItemButton
                  sx={{ pl: 4, borderRadius: '8px', mx: 1, mb: 0.5 }}
                  selected={isMenuActive('/admin/products/add')}
                  onClick={() => navigate('/admin/products/add')}
                >
                  <ListItemIcon sx={{ minWidth: 35 }}>
                    <AddIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Thêm sản phẩm" />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Orders */}
            <ListItem
              button
              onClick={() => navigate('/admin/orders')}
              selected={isMenuActive('/admin/orders')}
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
                  color: isMenuActive('/admin/orders') ? 'white' : 'inherit'
                }}
              >
                <ReceiptIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Đơn hàng" 
                sx={{ 
                  opacity: open ? 1 : 0,
                  '& .MuiTypography-root': {
                    fontWeight: 500
                  }
                }} 
              />
            </ListItem>

            {/* Reports */}
            <ListItem
              button
              onClick={() => setOpenReportMenu(!openReportMenu)}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                mb: 0.5,
                bgcolor: isSubmenuActive(['/admin/reports']) && !isMenuActive('/admin/dashboard') ? 
                  'rgba(99, 102, 241, 0.1)' : 'transparent',
                borderRadius: '8px',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: isSubmenuActive(['/admin/reports']) ? 'primary.main' : 'inherit'
                }}
              >
                <AssessmentIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Báo cáo & Thống kê" 
                sx={{ 
                  opacity: open ? 1 : 0,
                  '& .MuiTypography-root': {
                    fontWeight: 500
                  }
                }} 
              />
              {open && (openReportMenu ? <ExpandLess /> : <ExpandMore />)}
            </ListItem>

            {/* Reports submenu */}
            <Collapse in={openReportMenu && open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton
                  sx={{ pl: 4, borderRadius: '8px', mx: 1, mb: 0.5 }}
                  selected={isMenuActive('/admin/reports/sales')}
                  onClick={() => navigate('/admin/reports/sales')}
                >
                  <ListItemIcon sx={{ minWidth: 35 }}>
                    <ShoppingCartIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Doanh số bán hàng" />
                </ListItemButton>
                
                <ListItemButton
                  sx={{ pl: 4, borderRadius: '8px', mx: 1, mb: 0.5 }}
                  selected={isMenuActive('/admin/reports/courses')}
                  onClick={() => navigate('/admin/reports/courses')}
                >
                  <ListItemIcon sx={{ minWidth: 35 }}>
                    <SchoolIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Thống kê khóa học" />
                </ListItemButton>
                
                <ListItemButton
                  sx={{ pl: 4, borderRadius: '8px', mx: 1, mb: 0.5 }}
                  selected={isMenuActive('/admin/reports/users')}
                  onClick={() => navigate('/admin/reports/users')}
                >
                  <ListItemIcon sx={{ minWidth: 35 }}>
                    <PeopleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Thống kê người dùng" />
                </ListItemButton>
                
                <ListItemButton
                  sx={{ pl: 4, borderRadius: '8px', mx: 1, mb: 0.5 }}
                  selected={isMenuActive('/admin/reports/ratings')}
                  onClick={() => navigate('/admin/reports/ratings')}
                >
                  <ListItemIcon sx={{ minWidth: 35 }}>
                    <StarIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Đánh giá & Phản hồi" />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Settings */}
            <ListItem
              button
              onClick={() => navigate('/admin/settings')}
              selected={isMenuActive('/admin/settings')}
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
                  color: isMenuActive('/admin/settings') ? 'white' : 'inherit'
                }}
              >
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Cài đặt" 
                sx={{ 
                  opacity: open ? 1 : 0,
                  '& .MuiTypography-root': {
                    fontWeight: 500
                  }
                }} 
              />
            </ListItem>
          </List>
        </Drawer>

        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            pb: 12, 
            pt: 3, 
            px: 3,
            mt: 8, 
            backgroundColor: theme.palette.background.default,
            minHeight: 'calc(100vh - 60px)',
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