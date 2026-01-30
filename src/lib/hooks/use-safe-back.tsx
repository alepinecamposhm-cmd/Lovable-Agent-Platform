import { useNavigate } from 'react-router-dom';

export function useSafeBack() {
  const navigate = useNavigate();
  return (defaultPath: string) => {
    try {
      if (window.history.length <= 1) {
        navigate(defaultPath);
      } else {
        navigate(-1);
      }
    } catch (e) {
      // fallback to direct navigate if something unexpected
      navigate(defaultPath);
    }
  };
}
