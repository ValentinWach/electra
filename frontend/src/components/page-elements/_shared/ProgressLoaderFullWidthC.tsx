export default function ProgressLoaderFullWidthC() {
    return (
        <div className=" sm:mt-6 flex justify-center">
            <div className="loader w-full rounded" style={{
                height: '4px',
                background: 'no-repeat linear-gradient(#6100ee 0 0), no-repeat linear-gradient(#6100ee 0 0), #d7b8fc',
                backgroundSize: '60% 100%',
                animation: 'l16 3s infinite'
            }} />
            <style>{`
              @keyframes l16 {
                0%   {background-position:-150% 0,-150% 0}
                66%  {background-position: 250% 0,-150% 0}
                100% {background-position: 250% 0, 250% 0}
              }
            `}</style>
        </div>
    )
}