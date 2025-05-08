import uvicorn
import sys
import argparse
import platform
import multiprocessing

def get_worker_count():
    return max(1, min(8, multiprocessing.cpu_count()))

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Run the server in development or production mode')
    parser.add_argument('env', choices=['dev', 'prod'], help='Environment to run the server in (dev/prod)')
    args = parser.parse_args()

    is_windows = platform.system() == "Windows"
    worker_count = get_worker_count()

    config = {
        'dev': {
            'workers': 1,
            'reload': True,
            'reload_delay': 0.25 if is_windows else None,  # Only needed on Windows
            'log_level': 'info'
        },
        'prod': {
            'workers': worker_count,  # Use CPU count on both platforms
            'reload': False,
            'log_level': 'info'  # Keep info logging in prod for better visibility
        }
    }[args.env]

    print(f'Starting server in {args.env} mode on {platform.system()}...')
    if args.env == 'dev':
        print('Running without workers in dev mode.')
    elif args.env == 'prod':
        print(f'Running with {config["workers"]} workers')

    uvicorn.run(
        'app.main:app',
        host='0.0.0.0',
        port=8000,
        reload=config['reload'],
        workers=config['workers'],
        log_level=config['log_level'],
        reload_delay=config.get('reload_delay', None)
    ) 