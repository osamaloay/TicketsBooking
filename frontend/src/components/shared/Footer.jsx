import { Link } from 'react-router-dom';
import { Box, Container, Typography, Link as MuiLink } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[900],
        color: 'white'
      }}
    >
      <Container maxWidth="sm">
        <Typography variant="body1" align="center">
          © {new Date().getFullYear()} Ticketiez 
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          <MuiLink component={Link} to="/contact" color="inherit" sx={{ mx: 1 }}>
            Contact Us
          </MuiLink>
          {' | '}
          <MuiLink component={Link} to="/about" color="inherit" sx={{ mx: 1 }}>
            About
          </MuiLink>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 