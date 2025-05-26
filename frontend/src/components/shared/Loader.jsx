import { Box, CircularProgress } from '@mui/material';

const Loader = ({ size = 40 }) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="200px"
    >
      <CircularProgress size={size} />
    </Box>
  );
};

export default Loader; 