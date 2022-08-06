import { createTheme } from '@mui/material/styles';

const light = createTheme();
const dark = createTheme({
    palette: {
        mode: 'dark',
    },
});

export { light, dark };

export default light;
