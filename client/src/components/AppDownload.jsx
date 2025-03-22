import { assets } from '../assets/assets'

const AppDownload = () => {
    return (
        <div className='bg-[#E7F4E8] relative'>
            <div className='container mx-auto py-20 px-5'>
                <div className='max-w-xl'>
                    <h3 className='text-3xl font-bold mb-5'>Get Our Job Search App</h3>
                    <p className='text-gray-500 mb-10'>Download our app for the fastest, most convenient way to find and apply for the best jobs in your area.</p>
                    <div className='flex gap-5 items-center'>
                        <img className='w-40 cursor-pointer hover:scale-105 transition-transform' src={assets.play_store} alt="Download from Google Play" />
                        <img className='w-40 cursor-pointer hover:scale-105 transition-transform' src={assets.app_store} alt="Download from App Store" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AppDownload