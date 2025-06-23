import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/immersive-dashboard.css';
import NavHeader from '@/components/NavHeader';

// Import Three.js and related libraries
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Chart from 'chart.js/auto';
import gsap from 'gsap';

// We'll use Lucide React icons instead of Font Awesome
import { 
  BarChart3, 
  PieChart, 
  Network, 
  FileText, 
  Mountain, 
  Bolt, 
  Droplets, 
  Link, 
  TrendingUp, 
  X 
} from 'lucide-react';

const ImmersiveDashboard: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const detailsContainerRef = useRef<HTMLDivElement>(null);
  const performanceChartRef = useRef<HTMLCanvasElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [activeView, setActiveView] = useState('heatmap');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  
  // Sample portfolio data - moved outside of render for performance
  const portfolioData = {
    assets: [
      { 
        id: 'btc', 
        name: 'Bitcoin', 
        symbol: 'BTC', 
        value: 1500000, 
        currentPrice: 31245.50,
        volatility: 0.82, 
        liquidity: 0.92, 
        correlation: 0.65,
        dailyChange: 1.4,
        color: '#f7931a',
        history: [45, 48, 52, 55, 58, 62, 65]
      },
      { 
        id: 'eth', 
        name: 'Ethereum', 
        symbol: 'ETH', 
        value: 1200000, 
        currentPrice: 2450.32,
        volatility: 0.78, 
        liquidity: 0.85, 
        correlation: 0.72,
        dailyChange: -1.8,
        color: '#627eea',
        history: [40, 42, 45, 50, 55, 60, 65]
      },
      { 
        id: 'sol', 
        name: 'Solana', 
        symbol: 'SOL', 
        value: 800000, 
        currentPrice: 32.18,
        volatility: 0.91, 
        liquidity: 0.62, 
        correlation: 0.58,
        dailyChange: 3.2,
        color: '#00ffbd',
        history: [60, 65, 68, 72, 75, 78, 82]
      },
      { 
        id: 'avax', 
        name: 'Avalanche', 
        symbol: 'AVAX', 
        value: 450000, 
        currentPrice: 12.45,
        volatility: 0.87, 
        liquidity: 0.73, 
        correlation: 0.64,
        dailyChange: -0.5,
        color: '#e84142',
        history: [55, 58, 60, 62, 65, 68, 70]
      }
    ],
    portfolioHistory: [3200000, 3400000, 3800000, 4000000, 4100000, 4200000, 4287000],
    riskHistory: [45, 50, 55, 60, 65, 70, 72]
  };

  // Initialize performance chart
  const initPerformanceChart = () => {
    if (!performanceChartRef.current) return;
    
    const ctx = performanceChartRef.current.getContext('2d');
    if (!ctx) return;
    
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Portfolio Value',
            data: portfolioData.portfolioHistory.map(val => val / 1000000),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Risk Score',
            data: portfolioData.riskHistory,
            borderColor: '#f59e0b',
            backgroundColor: 'transparent',
            tension: 0.4,
            borderDash: [5, 5],
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              callback: function(value) {
                return '$' + value + 'M';
              }
            }
          },
          y1: {
            position: 'right',
            beginAtZero: true,
            max: 100,
            grid: {
              display: false
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          },
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: 'rgba(255, 255, 255, 0.9)',
            bodyColor: 'rgba(255, 255, 255, 0.7)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.datasetIndex === 0) {
                  label += '$' + context.parsed.y + 'M';
                } else {
                  label += context.parsed.y;
                }
                return label;
              }
            }
          }
        }
      }
    });
  };

  useEffect(() => {
    // Start loading Three.js resources
    let loadingInterval: NodeJS.Timeout;
    
    // Simulate loading progress
    loadingInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(loadingInterval);
          setTimeout(() => {
            setIsLoading(false);
            // Initialize scene after loading is complete
            initScene();
            // Initialize performance chart
            initPerformanceChart();
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    // Cleanup function
    return () => {
      clearInterval(loadingInterval);
      
      // Remove any event listeners or cleanup ThreeJS resources
      const threeJSRenderer = (window as any).renderer;
      if (threeJSRenderer) {
        threeJSRenderer.dispose();
      }
    };
  }, []);
  
  // Store references to the view groups and camera for use in the view change effect
  const sceneRef = useRef<{
    heatmapGroup?: THREE.Group;
    networkGroup?: THREE.Group;
    contractGroup?: THREE.Group;
    riskGroup?: THREE.Group;
    camera?: THREE.PerspectiveCamera;
  }>({});
  
  // Effect to handle view changes
  useEffect(() => {
    const { heatmapGroup, networkGroup, contractGroup, riskGroup, camera } = sceneRef.current;
    
    if (!heatmapGroup || !networkGroup || !contractGroup || !riskGroup || !camera) return;
    
    // Hide all groups
    heatmapGroup.visible = false;
    networkGroup.visible = false;
    contractGroup.visible = false;
    riskGroup.visible = false;
    
    // Show the active view
    if (activeView === 'heatmap') {
      heatmapGroup.visible = true;
      gsap.to(camera.position, { x: 0, y: 15, z: 15, duration: 1.5, ease: 'power2.inOut' });
    } else if (activeView === 'network') {
      networkGroup.visible = true;
      gsap.to(camera.position, { x: 0, y: 5, z: 15, duration: 1.5, ease: 'power2.inOut' });
    } else if (activeView === 'contracts') {
      contractGroup.visible = true;
      gsap.to(camera.position, { x: 0, y: 8, z: 12, duration: 1.5, ease: 'power2.inOut' });
    } else if (activeView === 'risk') {
      riskGroup.visible = true;
      gsap.to(camera.position, { x: 0, y: 10, z: 20, duration: 1.5, ease: 'power2.inOut' });
    }
  }, [activeView]);

  // Function to initialize the 3D scene
  const initScene = () => {
    try {
      const container = containerRef.current;
      if (!container) return;
      
      // Clear any existing content
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      // Create scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0f172a);
      
      // Add lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
      scene.add(ambientLight);
      
      const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight1.position.set(1, 1, 1);
      scene.add(directionalLight1);
      
      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight2.position.set(-1, -1, -1);
      scene.add(directionalLight2);
      
      // Create camera
      const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.set(0, 5, 15);
      
      // Create renderer
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: "high-performance"
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);
      
      // Add orbit controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      controls.minDistance = 5;
      controls.maxDistance = 50;
      controls.maxPolarAngle = Math.PI * 0.9;
      controls.minPolarAngle = Math.PI * 0.1;
      
      // Create groups for different views
      const heatmapGroup = new THREE.Group();
      const networkGroup = new THREE.Group();
      const contractGroup = new THREE.Group();
      const riskGroup = new THREE.Group();
      
      scene.add(heatmapGroup);
      scene.add(networkGroup);
      scene.add(contractGroup);
      scene.add(riskGroup);
      
      // Hide all groups initially
      heatmapGroup.visible = false;
      networkGroup.visible = false;
      contractGroup.visible = false;
      riskGroup.visible = false;
      
      // Store references for use in the view change effect
      sceneRef.current = {
        heatmapGroup,
        networkGroup,
        contractGroup,
        riskGroup,
        camera
      };
      
      // Add background particles
      const particlesGeometry = new THREE.BufferGeometry();
      const count = 1000;
      
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        
        colors[i * 3] = 0.2 + Math.random() * 0.3;
        colors[i * 3 + 1] = 0.2 + Math.random() * 0.3;
        colors[i * 3 + 2] = 0.3 + Math.random() * 0.4;
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.1,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.5
      });
      
      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);
      
      // Initialize Heatmap View
      const initHeatmapView = () => {
        // Create a grid for the heatmap
        const gridSize = 20;
        const gridDivisions = 20;
        const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x444444, 0x222222);
        gridHelper.position.y = -0.5;
        heatmapGroup.add(gridHelper);
        
        // Create heatmap surface
        const heatmapGeometry = new THREE.PlaneGeometry(20, 20, 50, 50);
        const heatmapMaterial = new THREE.MeshStandardMaterial({
          color: 0x222222,
          wireframe: false,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
          metalness: 0.3,
          roughness: 0.8
        });
        
        const heatmap = new THREE.Mesh(heatmapGeometry, heatmapMaterial);
        heatmap.rotation.x = -Math.PI / 2;
        heatmap.position.y = -0.4;
        heatmapGroup.add(heatmap);
        
        // Add asset towers on the heatmap
        portfolioData.assets.forEach((asset, index) => {
          // Position in a circular pattern
          const angle = (index / portfolioData.assets.length) * Math.PI * 2;
          const radius = 6;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          
          // Scale based on value
          const height = asset.value / 100000;
          
          // Color based on volatility (red = high, green = low)
          const volatilityColor = new THREE.Color(
            Math.min(1, asset.volatility),
            Math.min(1, 1 - asset.volatility + 0.2),
            0.2
          );
          
          const geometry = new THREE.BoxGeometry(1, height, 1);
          const material = new THREE.MeshPhongMaterial({ 
            color: volatilityColor,
            transparent: true,
            opacity: 0.8,
            emissive: volatilityColor,
            emissiveIntensity: 0.2
          });
          
          const tower = new THREE.Mesh(geometry, material);
          tower.position.set(x, height/2, z);
          tower.userData = { asset };
          tower.castShadow = true;
          tower.receiveShadow = true;
          
          // Add glow effect
          const glowGeometry = new THREE.SphereGeometry(0.2, 16, 16);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: volatilityColor,
            transparent: true,
            opacity: 0.5
          });
          
          const glow = new THREE.Mesh(glowGeometry, glowMaterial);
          glow.position.y = height + 0.5;
          tower.add(glow);
          
          // Add label
          const canvas = document.createElement('canvas');
          canvas.width = 256;
          canvas.height = 128;
          const context = canvas.getContext('2d');
          if (context) {
            context.fillStyle = '#ffffff';
            context.font = 'Bold 24px Arial';
            context.fillText(asset.symbol, 10, 64);
            
            const texture = new THREE.CanvasTexture(canvas);
            const labelMaterial = new THREE.SpriteMaterial({
              map: texture,
              transparent: true
            });
            
            const label = new THREE.Sprite(labelMaterial);
            label.position.y = height + 1;
            label.scale.set(2, 1, 1);
            tower.add(label);
          }
          
          heatmapGroup.add(tower);
        });
      };
      
      // Initialize Network View
      const initNetworkView = () => {
        // Create central node
        const centralGeometry = new THREE.SphereGeometry(1.5, 32, 32);
        const centralMaterial = new THREE.MeshPhongMaterial({
          color: 0x6366f1,
          emissive: 0x6366f1,
          emissiveIntensity: 0.2,
          transparent: true,
          opacity: 0.9
        });
        
        const centralNode = new THREE.Mesh(centralGeometry, centralMaterial);
        networkGroup.add(centralNode);
        
        // Create asset nodes
        portfolioData.assets.forEach((asset, index) => {
          // Position in a circular pattern
          const angle = (index / portfolioData.assets.length) * Math.PI * 2;
          const radius = 8;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          
          // Size based on value
          const size = 0.5 + (asset.value / 1500000);
          
          // Create node
          const nodeGeometry = new THREE.SphereGeometry(size, 32, 32);
          const nodeMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(asset.color),
            emissive: new THREE.Color(asset.color),
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.8
          });
          
          const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
          node.position.set(x, 0, z);
          node.userData = { asset };
          
          // Create connection line
          const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x6366f1,
            transparent: true,
            opacity: 0.3
          });
          
          const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(x, 0, z)
          ]);
          
          const line = new THREE.Line(lineGeometry, lineMaterial);
          networkGroup.add(line);
          
          // Add label
          const canvas = document.createElement('canvas');
          canvas.width = 256;
          canvas.height = 128;
          const context = canvas.getContext('2d');
          if (context) {
            context.fillStyle = '#ffffff';
            context.font = 'Bold 24px Arial';
            context.fillText(asset.symbol, 10, 64);
            
            const texture = new THREE.CanvasTexture(canvas);
            const labelMaterial = new THREE.SpriteMaterial({
              map: texture,
              transparent: true
            });
            
            const label = new THREE.Sprite(labelMaterial);
            label.position.y = size + 1;
            label.scale.set(2, 1, 1);
            node.add(label);
          }
          
          networkGroup.add(node);
        });
      };
      
      // Initialize Contract View
      const initContractView = () => {
        // Create a platform
        const platformGeometry = new THREE.CylinderGeometry(10, 10, 0.5, 32);
        const platformMaterial = new THREE.MeshPhongMaterial({
          color: 0x222222,
          transparent: true,
          opacity: 0.7
        });
        
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.y = -0.25;
        contractGroup.add(platform);
        
        // Create contract objects
        const contracts = [
          { 
            id: 'c1', 
            name: 'Lending Agreement', 
            type: 'Lending',
            parties: ['btc', 'eth'], 
            risk: 0.62,
            value: 750000,
            maturity: '2023-12-15'
          },
          { 
            id: 'c2', 
            name: 'Derivative Contract', 
            type: 'Derivative',
            parties: ['sol', 'avax'], 
            risk: 0.83,
            value: 320000,
            maturity: '2023-09-30'
          },
          { 
            id: 'c3', 
            name: 'Staking Pool', 
            type: 'Staking',
            parties: ['dot', 'usdc'], 
            risk: 0.42,
            value: 180000,
            maturity: '2024-03-01'
          },
          { 
            id: 'c4', 
            name: 'Liquidity Pool', 
            type: 'LP',
            parties: ['eth', 'link'], 
            risk: 0.71,
            value: 420000,
            maturity: '2023-11-15'
          }
        ];
        
        contracts.forEach((contract, index) => {
          // Position in a circular pattern
          const angle = (index / contracts.length) * Math.PI * 2;
          const radius = 6;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          
          // Create contract object
          const contractGeometry = new THREE.BoxGeometry(2, 3, 2);
          
          // Color based on risk
          const riskColor = new THREE.Color(
            Math.min(1, contract.risk + 0.2),
            Math.min(1, 1 - contract.risk + 0.2),
            0.3
          );
          
          const contractMaterial = new THREE.MeshPhongMaterial({
            color: riskColor,
            transparent: true,
            opacity: 0.8,
            emissive: riskColor,
            emissiveIntensity: 0.2
          });
          
          const contractMesh = new THREE.Mesh(contractGeometry, contractMaterial);
          contractMesh.position.set(x, 1.5, z);
          contractMesh.userData = { contract };
          
          // Add label
          const canvas = document.createElement('canvas');
          canvas.width = 512;
          canvas.height = 128;
          const context = canvas.getContext('2d');
          if (context) {
            context.fillStyle = '#ffffff';
            context.font = 'Bold 20px Arial';
            context.fillText(contract.type, 10, 64);
            
            const texture = new THREE.CanvasTexture(canvas);
            const labelMaterial = new THREE.SpriteMaterial({
              map: texture,
              transparent: true
            });
            
            const label = new THREE.Sprite(labelMaterial);
            label.position.y = 2.5;
            label.scale.set(3, 0.8, 1);
            contractMesh.add(label);
          }
          
          contractGroup.add(contractMesh);
        });
      };
      
      // Initialize Risk View
      const initRiskView = () => {
        // Create risk landscape
        const terrainGeometry = new THREE.PlaneGeometry(30, 30, 100, 100);
        
        // Modify vertices to create terrain
        const vertices = terrainGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
          // Skip the edges to keep them flat
          const x = vertices[i];
          const z = vertices[i + 2];
          
          if (Math.abs(x) < 14 && Math.abs(z) < 14) {
            // Create some mountains and valleys
            const distance = Math.sqrt(x * x + z * z);
            const height = Math.sin(distance * 0.5) * 2 + Math.cos(x * 0.5) * Math.sin(z * 0.5) * 3;
            
            vertices[i + 1] = height;
          }
        }
        
        // Update normals
        terrainGeometry.computeVertexNormals();
        
        // Create material with risk gradient
        const terrainMaterial = new THREE.MeshStandardMaterial({
          vertexColors: true,
          side: THREE.DoubleSide,
          metalness: 0.2,
          roughness: 0.8
        });
        
        // Add colors based on height (risk)
        const colors = [];
        for (let i = 0; i < vertices.length; i += 3) {
          const height = vertices[i + 1];
          
          // Normalize height to 0-1 range
          const normalizedHeight = (height + 3) / 6;
          
          // Green for low risk, yellow for medium, red for high
          if (normalizedHeight < 0.3) {
            colors.push(0.1, 0.7, 0.3); // Green
          } else if (normalizedHeight < 0.7) {
            colors.push(0.9, 0.6, 0.1); // Yellow
          } else {
            colors.push(0.9, 0.1, 0.1); // Red
          }
        }
        
        terrainGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        terrain.rotation.x = -Math.PI / 2;
        terrain.position.y = -2;
        riskGroup.add(terrain);
        
        // Add asset markers on the risk landscape
        portfolioData.assets.forEach((asset, index) => {
          // Position based on risk factors
          const x = (asset.volatility - 0.5) * 10;
          const z = (asset.correlation - 0.5) * 10;
          
          // Calculate height at this position (simplified)
          const distance = Math.sqrt(x * x + z * z);
          const y = Math.sin(distance * 0.5) * 2 + Math.cos(x * 0.5) * Math.sin(z * 0.5) * 3;
          
          // Create marker
          const markerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
          const markerMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(asset.color),
            emissive: new THREE.Color(asset.color),
            emissiveIntensity: 0.3
          });
          
          const marker = new THREE.Mesh(markerGeometry, markerMaterial);
          marker.position.set(x, y - 1, z);
          marker.userData = { asset };
          
          // Add flag pole
          const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
          const poleMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
          const pole = new THREE.Mesh(poleGeometry, poleMaterial);
          pole.position.y = 1;
          marker.add(pole);
          
          // Add flag
          const flagGeometry = new THREE.PlaneGeometry(1, 0.6);
          const flagMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(asset.color),
            side: THREE.DoubleSide
          });
          const flag = new THREE.Mesh(flagGeometry, flagMaterial);
          flag.position.set(0.5, 1.8, 0);
          flag.rotation.y = Math.PI / 2;
          marker.add(flag);
          
          // Add label
          const canvas = document.createElement('canvas');
          canvas.width = 256;
          canvas.height = 128;
          const context = canvas.getContext('2d');
          if (context) {
            context.fillStyle = '#ffffff';
            context.font = 'Bold 24px Arial';
            context.fillText(asset.symbol, 10, 64);
            
            const texture = new THREE.CanvasTexture(canvas);
            const labelMaterial = new THREE.SpriteMaterial({
              map: texture,
              transparent: true
            });
            
            const label = new THREE.Sprite(labelMaterial);
            label.position.y = 3;
            label.scale.set(2, 1, 1);
            marker.add(label);
          }
          
          riskGroup.add(marker);
        });
      };
      
      // Initialize all views
      initHeatmapView();
      initNetworkView();
      initContractView();
      initRiskView();
      
      // Set initial view visibility based on activeView
      if (activeView === 'heatmap') {
        heatmapGroup.visible = true;
      } else if (activeView === 'network') {
        networkGroup.visible = true;
      } else if (activeView === 'contracts') {
        contractGroup.visible = true;
      } else if (activeView === 'risk') {
        riskGroup.visible = true;
      } else {
        // Default to heatmap if no valid view is selected
        heatmapGroup.visible = true;
      }
    
      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        
        // Rotate groups slightly
        heatmapGroup.rotation.y += 0.002;
        networkGroup.rotation.y += 0.001;
        contractGroup.rotation.y += 0.001;
        riskGroup.rotation.y += 0.001;
        
        // Update particles
        particles.rotation.y += 0.0005;
        
        // Update controls
        controls.update();
        
        renderer.render(scene, camera);
      };
      
      // Start animation
      animate();
      
      // Handle window resize
      const handleResize = () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      
      window.addEventListener('resize', handleResize);
      
      // Store renderer in window for cleanup
      (window as any).renderer = renderer;
      
      // Return cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
        (window as any).renderer = null;
      };
    } catch (error) {
      console.error('Error initializing 3D scene:', error);
    }
  };
  
  // Handle view changes
  const handleViewChange = (view: string) => {
    setActiveView(view);
  };
  
  // Handle asset selection
  const handleAssetSelect = (asset: any) => {
    setSelectedAsset(asset);
  };
  
  // Close details panel
  const closeDetails = () => {
    setSelectedAsset(null);
  };

  return (
    <div className="immersive-dashboard">
      {isLoading ? (
        <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50">
          <div className="animate-pulse mb-4">
            <div className="text-4xl font-bold gradient-text mb-2">ARIES XR</div>
            <div className="text-center text-gray-400">Loading 3D Dashboard...</div>
          </div>
          <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mt-8">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${loadingProgress}%` }}></div>
          </div>
          <div className="mt-4 text-gray-400">{loadingProgress}%</div>
        </div>
      ) : null}
      
      <div ref={containerRef} className="w-full h-full"></div>

      <div id="ui-overlay" className="fixed inset-0 pointer-events-none">
        {/* Main Dashboard */}
        <div className="dashboard-panel pointer-events-auto absolute top-6 left-6 w-96 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold gradient-text">ARIES XR</h2>
              <p className="text-sm text-gray-400">Advanced Risk Intelligence Engine</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs">LIVE</span>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-3 flex items-center">
              <PieChart className="mr-2 text-blue-400 h-4 w-4" />
              Portfolio Overview
            </h3>
            <div className="flex justify-between items-end mb-2">
              <div>
                <div className="text-gray-400 text-sm">Total Value</div>
                <div className="text-3xl font-bold">$4,287,450</div>
              </div>
              <div className="text-right">
                <div className="text-gray-400 text-sm">Risk Score</div>
                <div className="flex items-center">
                  <div className="text-3xl font-bold text-yellow-400 mr-2">72</div>
                  <div className="w-16">
                    <div className="risk-meter">
                      <div className="risk-meter-fill" style={{ width: '72%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-400 mb-4">
              <div>24h: <span className="text-green-400">+2.4%</span></div>
              <div>7d: <span className="text-red-400">-1.2%</span></div>
              <div>30d: <span className="text-green-400">+5.8%</span></div>
              <div>90d: <span className="text-green-400">+12.3%</span></div>
            </div>
          </div>
          
          <div className="h-48 mb-6 relative">
            <canvas ref={performanceChartRef} id="performanceChart"></canvas>
            <div className="absolute bottom-2 right-2 flex space-x-1">
              <button className="text-xs bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded">1D</button>
              <button className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded">1W</button>
              <button className="text-xs bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded">1M</button>
              <button className="text-xs bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded">1Y</button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button 
              onClick={() => handleViewChange('heatmap')}
              className={`nav-button ${activeView === 'heatmap' ? 'active' : ''} bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-lg text-sm flex flex-col items-center`}
            >
              <BarChart3 className="text-orange-400 mb-1 h-5 w-5" />
              Heatmap
            </button>
            <button 
              onClick={() => handleViewChange('network')}
              className={`nav-button ${activeView === 'network' ? 'active' : ''} bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-lg text-sm flex flex-col items-center`}
            >
              <Network className="text-purple-400 mb-1 h-5 w-5" />
              Network
            </button>
            <button 
              onClick={() => handleViewChange('contracts')}
              className={`nav-button ${activeView === 'contracts' ? 'active' : ''} bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-lg text-sm flex flex-col items-center`}
            >
              <FileText className="text-blue-400 mb-1 h-5 w-5" />
              Contracts
            </button>
            <button 
              onClick={() => handleViewChange('risk')}
              className={`nav-button ${activeView === 'risk' ? 'active' : ''} bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-lg text-sm flex flex-col items-center`}
            >
              <Mountain className="text-red-400 mb-1 h-5 w-5" />
              Risk Zones
            </button>
          </div>
          
          <div className="flex justify-between text-xs text-gray-400">
            <div>Last updated: <span className="text-white">Just now</span></div>
            <div>Version: <span className="text-white">XR-2.4.1</span></div>
          </div>
        </div>
        
        {/* Risk Details Panel */}
        <div id="risk-details" className="dashboard-panel pointer-events-auto absolute top-6 right-6 w-96 p-6 transform translate-x-96 transition-transform duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg flex items-center">
              <TrendingUp className="mr-2 text-blue-400 h-5 w-5" />
              Risk Analysis
            </h3>
            <button onClick={closeDetails} className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 p-1 rounded-full">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div id="risk-content">
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-800 rounded-lg">
              <div>
                <div className="text-sm text-gray-400">Asset</div>
                <div id="risk-asset" className="font-bold text-xl">ETH/USD</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Current Value</div>
                <div id="risk-value" className="font-bold text-lg">$2,450.32</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Volatility</div>
                <div id="risk-volatility" className="font-bold text-yellow-400 flex items-center">
                  <Bolt className="mr-2 h-4 w-4" />
                  High
                </div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Liquidity</div>
                <div id="risk-liquidity" className="font-bold text-green-400 flex items-center">
                  <Droplets className="mr-2 h-4 w-4" />
                  Good
                </div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">Correlation</div>
                <div id="risk-correlation" className="font-bold text-blue-400 flex items-center">
                  <Link className="mr-2 h-4 w-4" />
                  0.72
                </div>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-sm text-gray-400 mb-1">24h Change</div>
                <div id="risk-change" className="font-bold text-red-400 flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 transform rotate-180" />
                  -1.8%
                </div>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Risk History</span>
                <span>Last 30 days</span>
              </div>
              <div className="h-40">
                <canvas id="risk-history"></canvas>
              </div>
            </div>
            
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-sm text-gray-400 mb-2">Recommendations</div>
              <div id="risk-recommendations" className="text-sm">
                <div className="flex items-start mb-2">
                  <i className="fas fa-info-circle text-blue-400 mt-1 mr-2"></i>
                  <span>Consider reducing exposure by 15-20% to balance portfolio risk</span>
                </div>
                <div className="flex items-start">
                  <i className="fas fa-lightbulb text-yellow-400 mt-1 mr-2"></i>
                  <span>Hedge with inverse products to mitigate downside volatility</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Heatmap Legend */}
        <div id="heatmap-legend" className="dashboard-panel pointer-events-auto absolute bottom-6 left-6 p-4 hidden">
          <div className="text-sm mb-2 flex items-center">
            <i className="fas fa-fire text-orange-400 mr-2"></i>
            Risk Heatmap
          </div>
          <div className="heatmap-legend rounded mb-2"></div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>
        
        {/* Notifications Panel */}
        <div id="notifications-panel" className="dashboard-panel pointer-events-auto absolute top-6 left-1/2 transform -translate-x-1/2 p-3 hidden">
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle text-yellow-400 mr-2"></i>
            <span className="text-sm">3 new risk alerts detected</span>
            <button className="ml-4 text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded">View</button>
          </div>
        </div>
        
        {/* VR Button */}
        <button id="enter-vr-btn" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-full pointer-events-auto hidden flex items-center">
          <i className="fas fa-vr-cardboard mr-2"></i>
          Enter VR Mode
        </button>
        
        {/* Loading Screen */}
        {isLoading && (
          <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50 transition-opacity duration-500">
            <div className="animate-pulse mb-4">
              <div className="text-4xl font-bold gradient-text mb-2">ARIES XR</div>
              <div className="text-center text-gray-400">Advanced Risk Intelligence Engine</div>
            </div>
            <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden mt-8">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${loadingProgress}%` }}></div>
            </div>
            <div className="mt-2 text-gray-400">{loadingProgress}%</div>
          </div>
        )}
      </div>

      <div className="absolute top-0 left-0 right-0 z-50 pointer-events-auto">
        <NavHeader 
          title="Immersive Dashboard" 
          subtitle="3D Risk Visualization" 
          showLogout={false}
        />
      </div>
    </div>
  );
};

export default ImmersiveDashboard;
