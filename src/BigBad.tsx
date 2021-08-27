import React from 'react';
import Dexie from 'dexie';

export const BigBad: React.FC<{}> = () => {
  const deleteData = () => {
    Dexie.delete('eve-market').then(() => window.location.reload());
  };
  const restart = () => window.location.reload();

  return (
    <div style={{ padding: 100 }}>
      <p>
        This sucks. Something went wrong and this amazing app crashed. Most
        likely,{' '}
        <b>
          just <button onClick={restart}>restart</button> it and try again
        </b>{' '}
        and it will work.
      </p>
      <p>
        We went ahead and logged this error, so if you bug me, and tell me the
        date/time it happened, I can look it up and promptly ignore your issue
        in detail.
      </p>
      <p>
        If it keeps crashing over and over, hit this button and we will
        completely <b>delete your entire DB</b> so you start from scratch.
        <button onClick={deleteData}>Delete All Data</button>
      </p>
      <p>Please only do this as a last resort.</p>
    </div>
  );
};
