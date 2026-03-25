import React from 'react';

export const toast = {
  success: (msg: string) => console.log('[toast:success]', msg),
  error: (msg: string) => console.error('[toast:error]', msg),
  warning: (msg: string) => console.warn('[toast:warning]', msg),
  info: (msg: string) => console.info('[toast:info]', msg),
};

export function Toaster() {
  return <></>;
}
