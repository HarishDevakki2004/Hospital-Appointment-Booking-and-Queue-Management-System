import React from 'react'
import Header from '../components/Header'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import SpecialityMenu from '../components/SpecialityMenu'
import Reviews from '../components/Reviews'

const Home = () => {
  return (
    <div className="pb-4 md:pb-0">
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <Reviews />
      <Banner />
    </div>
  )
}

export default Home