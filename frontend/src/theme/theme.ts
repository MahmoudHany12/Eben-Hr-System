import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#00BF63',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#324158',
            contrastText: '#ffffff',
        },
        background: {
            default: '#ffffff',
            paper: '#ffffff',
        },
        error: {
            main: '#dc2626',
        },
        success: {
            main: '#005424',
        },
        warning: {
            main: '#d97706',
        },
        text: {
            primary: '#0f172a',
            secondary: '#475569',
        },
    },
    typography: {
        fontFamily: ['Plus Jakarta Sans', 'Segoe UI', 'sans-serif'].join(','),
        h1: { fontWeight: 800 },
        h2: { fontWeight: 800 },
        h3: { fontWeight: 700 },
        h4: { fontWeight: 700 },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 700 },
        button: {
            textTransform: 'none',
            fontWeight: 700,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#ffffff',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 10px 30px rgba(50, 65, 88, 0.06)',
                    border: '1px solid rgba(50, 65, 88, 0.06)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundClip: 'padding-box',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '10px 16px',
                },
                containedPrimary: {
                    boxShadow: 'none',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    '&.Mui-selected': {
                        backgroundColor: '#e9fff0',
                        color: '#005424',
                    },
                    '&:hover': {
                        backgroundColor: 'rgba(0,191,99,0.06)'
                    }
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    backgroundColor: '#f6f9f7',
                    fontWeight: 700,
                },
                root: {
                    padding: '12px 16px',
                }
            }
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.02)'
                    }
                }
            }
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined'
            }
        },
    },
});
