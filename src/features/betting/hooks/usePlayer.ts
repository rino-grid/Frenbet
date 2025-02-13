import { useState } from 'react';
import { USER_NAME_KEY } from '../constants';

export function usePlayer() {
  const [playerName, setPlayerName] = useState(() => {
    const savedName = localStorage.getItem(USER_NAME_KEY);
    return savedName || '';
  });

  const [isNameSubmitted, setIsNameSubmitted] = useState(() => {
    return !!localStorage.getItem(USER_NAME_KEY);
  });

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      localStorage.setItem(USER_NAME_KEY, playerName.trim());
      setIsNameSubmitted(true);
    }
  };

  return {
    playerName,
    setPlayerName,
    isNameSubmitted,
    handleNameSubmit,
  };
}