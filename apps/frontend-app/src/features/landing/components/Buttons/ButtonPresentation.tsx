
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

const YellowOutlinedButton = styled(Button)(() => ({
  color: '#FFC400',
  borderColor: '#FFC400',
  borderRadius: '8px', 
  padding: '2.5vh 6vw',
  textTransform: 'none', 
  fontWeight: 400,
  fontSize: '16px',
  backgroundColor: 'white',
  '&:hover': {
    backgroundColor: '#fff9e6',
    borderColor: '#FFC400',
  },
}));

export function ButtonPresentation() {
  return (
    <YellowOutlinedButton variant="outlined">
      Ver planes
    </YellowOutlinedButton>
  );
}
