import React from 'react';
import description from './descAbout';

const AboutPage = () => {
  return (
    <div className='h-screen w-full bg-main flex items-center justify-center'>
      <div className='flex flex-row items-center gap-x-[250px] w-[80%]'>
        <div className='flex flex-col items-center w-[50%]'>
          <h1 className='text-main text-8xl text-left m-auto'>Quickly augment your <br/> images automatically</h1>
          <p className='text-2xl text-main text-left mt-4'>{description}</p>
        </div>
        <img src="/images/Mutant.png" className='h-[30%] w-[30%] object-contain'></img>
      </div>
    </div>
  );
};

export default AboutPage;