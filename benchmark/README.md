# Benchmark Setup

These benchmarks are run with the following setup:

- **t-values**: 0.5, 2.0, 5.0
- **Clients**: 100, 1000, 10000

**Note**: Because the application is not deployed productively, the same machine that handled the requests also ran the server. This restricts the significance of the results as many resources are used to perform the requests.

**Evaluation Tool**: Locust was used to evaluate the performance. The results are exported as HTML and can be interactively explored in the browser.

## Improvements

Improvements made because of the tests:
- When starting the server in production mode, we now use more workers, which significantly improves performance under heavy load.
- In general, speeds are mostly limited by the server technology, as most queries are based on materialized views that are refreshed once after an election and then only queried.

## Hardware Specifications

- **Model**: Dell XPS 15
- **CPU**: 11th Gen Intel(R) Core(TM) i7-11800H @ 2.30GHz
  - Base speed: 2.30 GHz
  - Sockets: 1
  - Cores: 8
  - Logical processors: 16
  - Virtualization: Enabled
  - L1 cache: 640 KB
  - L2 cache: 10.0 MB
  - L3 cache: 24.0 MB

- **Memory**: 32.0 GB
  - Speed: 3200 MT/s
  - Slots used: 2 of 2
  - Form factor: SODIMM
  - Hardware reserved: 280 MB

- **Disk**: NVMe PC711 NVMe SK hynix 1TB
  - Capacity: 954 GB
  - Formatted: 954 GB
  - System disk: Yes
  - Page file: Yes
  - Type: SSD

**Database Configuration**: The database ran in a Docker container, which was allocated 16 GB of memory, 16 GB swap, and access to all cores.