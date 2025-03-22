import { useContext, useRef } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'

const Hero = () => {

    const { setSearchFilter, setIsSearched } = useContext(AppContext)

    const titleRef = useRef(null)
    const locationRef = useRef(null)

    const onSearch = () => {
        setSearchFilter({
            title: titleRef.current.value,
            location: locationRef.current.value
        })
        setIsSearched(true)
    }

    return (
        <div className='container 2xl:px-20 mx-auto my-10'>
            <div className='bg-gradient-to-r from-purple-800 to-purple-950 text-white py-20 text-center mx-2 rounded-2xl shadow-xl'>
                <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold mb-6'>Take the next step</h2>
                <p className='mb-10 max-w-2xl mx-auto text-lg font-light px-5'>Nexus, we guide you to find your dream job</p>
                <div className='flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-full text-gray-100 max-w-2xl pl-6 mx-4 sm:mx-auto border border-white/20'>
                    <div className='flex items-center flex-1'>
                        <img className='h-5 sm:h-6 mr-2' src={assets.search_icon} alt="" />
                        <input type="text"
                            placeholder='Search for jobs'
                            className='bg-transparent p-3 rounded outline-none w-full placeholder-gray-300'
                            ref={titleRef}
                        />
                    </div>
                    <div className='flex items-center flex-1 border-l border-white/20'>
                        <img className='h-5 sm:h-6 mx-2' src={assets.location_icon} alt="" />
                        <input type="text"
                            placeholder='Location'
                            className='bg-transparent p-3 rounded outline-none w-full placeholder-gray-300'
                            ref={locationRef}
                        />
                    </div>
                    <button onClick={onSearch} className='bg-white text-purple-800 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors'>Search</button>
                </div>
            </div>

            <div className='border border-gray-200 shadow-lg mx-2 mt-8 p-8 rounded-xl bg-white'>
                <div className='flex justify-center gap-12 lg:gap-20 flex-wrap'>
                    <p className='font-semibold text-gray-700'>Trusted by</p>
                    <img className='h-8 opacity-70 hover:opacity-100 transition-opacity' src={assets.microsoft_logo} alt="" />
                    <img className='h-8 opacity-70 hover:opacity-100 transition-opacity' src={assets.walmart_logo} alt="" />
                    <img className='h-8 opacity-70 hover:opacity-100 transition-opacity' src={assets.accenture_logo} alt="" />
                    <img className='h-8 opacity-70 hover:opacity-100 transition-opacity' src={assets.samsung_logo} alt="" />
                    <img className='h-8 opacity-70 hover:opacity-100 transition-opacity' src={assets.amazon_logo} alt="" />
                    <img className='h-8 opacity-70 hover:opacity-100 transition-opacity' src={assets.adobe_logo} alt="" />
                </div>
            </div>
        </div>
    )
}

export default Hero