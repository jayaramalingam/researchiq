import React, { useState, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Clock,
  X,
  BookOpen,
  Loader2
} from 'lucide-react';
import { MapNode, MapLink, Paper, NavTab } from '../types';
import { fetchResearchMap, getOrCreateDemoProject } from '../services/api';

interface ResearchMapScreenProps {
  onSelectPaper: (paperId: string) => void;
  onNavigate: (tab: NavTab) => void;
  projectId?: string;
}

export const ResearchMapScreen: React.FC<ResearchMapScreenProps> = ({
  onSelectPaper,
  onNavigate,
  projectId
}) => {
  const [viewMode, setViewMode] = useState<'topics' | 'timeline'>('topics');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [activeCluster, setActiveCluster] = useState<string>('All');

  const [mapNodes, setMapNodes] = useState<MapNode[]>([]);
  const [mapLinks, setMapLinks] = useState<MapLink[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [clusters, setClusters] = useState<string[]>(['All']);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const mapData = await fetchResearchMap(projectId);
        if (isMounted) {
          setMapNodes(mapData.nodes);
          setMapLinks(mapData.links);
          setPapers(mapData.papers);
          setClusters(mapData.clusters);
          if (mapData.nodes.length > 0) {
            setSelectedNodeId(mapData.nodes[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load Research Map from backend:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const selectedNode = mapNodes.find((n) => n.id === selectedNodeId);
  const associatedPaper = papers.find((p) => p.id === selectedNode?.paperId || p.id === selectedNode?.id);

  // Position adjustments based on view mode (Timeline organizes by year horizontally, Topics organizes by cluster)
  const getNodePos = (node: MapNode) => {
    if (viewMode === 'timeline') {
      const yearOffset = (((node.year || 2025) - 2022) / 3) * 70 + 15;
      const yOffset = (node.y % 60) + 20;
      return { x: Math.max(10, Math.min(90, yearOffset)), y: yOffset };
    }
    return { x: node.x, y: node.y };
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(1.8, Math.max(0.6, prev + delta)));
  };

  const resetView = () => {
    setZoomLevel(1);
    if (mapNodes.length > 0) {
      setSelectedNodeId(mapNodes[0].id);
    } else {
      setSelectedNodeId(null);
    }
    setActiveCluster('All');
  };

  return (
    <div className="h-full flex-1 min-h-0 w-full flex flex-col relative rounded-2xl overflow-hidden glass-card border border-white/[0.14] shadow-[0_8px_32px_0_rgba(0,0,0,0.55)] animate-in fade-in duration-300">
      {/* Top Map Header & Controls Overlay */}
      <div className="absolute top-0 left-0 w-full z-20 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 pointer-events-none bg-gradient-to-b from-[#0C0B0A]/95 via-[#0C0B0A]/50 to-transparent">
        <div className="space-y-0.5 pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-[0_0_10px_#F59E0B] animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
              Research Map
            </h2>
            {isLoading && (
              <span className="flex items-center gap-1.5 text-xs font-mono text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-full border border-[#F59E0B]/30">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Loading DB Map...</span>
              </span>
            )}
          </div>
          <p className="font-mono text-xs text-stone-400">
            Constellation Topology — Semantic affinity & citation topology
          </p>
        </div>

        {/* Cluster Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto">
          {clusters.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCluster(c)}
              className={`px-3 py-1 rounded-full text-[11px] font-mono transition-all ${
                activeCluster === c
                  ? 'bg-[#F59E0B] text-[#0C0B0A] font-bold shadow-[0_0_10px_#F59E0B]'
                  : 'bg-white/[0.06] hover:bg-white/10 text-stone-300 border border-white/10'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div
        className="flex-1 w-full h-full relative cursor-crosshair overflow-hidden"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}
      >
        {/* Ambient Cluster Light Halos */}
        <div className="absolute top-[28%] left-[22%] w-64 h-64 bg-[#B45309]/25 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-[50%] left-[50%] w-72 h-72 bg-[#4C1D95]/30 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-[82%] left-[32%] w-60 h-60 bg-[#C2410C]/25 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />

        {/* SVG Connections / Edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {mapLinks.map((link, idx) => {
            const src = mapNodes.find((n) => n.id === link.source);
            const tgt = mapNodes.find((n) => n.id === link.target);
            if (!src || !tgt) return null;

            const p1 = getNodePos(src);
            const p2 = getNodePos(tgt);

            const isHighlighted =
              selectedNodeId === src.id ||
              selectedNodeId === tgt.id ||
              hoveredNodeId === src.id ||
              hoveredNodeId === tgt.id;

            return (
              <g key={idx}>
                <line
                  x1={`${p1.x}%`}
                  y1={`${p1.y}%`}
                  x2={`${p2.x}%`}
                  y2={`${p2.y}%`}
                  stroke={isHighlighted ? '#F59E0B' : '#B45309'}
                  strokeWidth={isHighlighted ? 2.5 : 1}
                  strokeOpacity={isHighlighted ? 0.9 : 0.25}
                  strokeDasharray={link.strength < 3 ? '4 4' : 'none'}
                />
              </g>
            );
          })}
        </svg>

        {/* Graph Nodes */}
        {mapNodes.map((node) => {
          const pos = getNodePos(node);
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;
          const matchesCluster = activeCluster === 'All' || node.cluster === activeCluster;

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNodeId(node.id)}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 transition-all duration-300 z-10 ${
                matchesCluster ? 'opacity-100' : 'opacity-25'
              }`}
              style={{ top: `${pos.y}%`, left: `${pos.x}%` }}
            >
              {/* Glowing Pulse Node Button */}
              <button
                type="button"
                className={`rounded-full transition-all duration-200 cursor-pointer active:scale-90 relative ${
                  node.color === '#4cd7f6'
                    ? 'bg-[#C2410C] shadow-[0_0_12px_#C2410C]'
                    : node.color === '#4edea3'
                    ? 'bg-[#F59E0B] shadow-[0_0_12px_#F59E0B]'
                    : node.color === '#F87171'
                    ? 'bg-[#F87171] shadow-[0_0_12px_#F87171]'
                    : 'bg-[#B45309] shadow-[0_0_12px_#B45309]'
                } ${isSelected ? 'ring-4 ring-white/80 scale-125' : isHovered ? 'scale-120' : ''}`}
                style={{
                  width: `${node.size}px`,
                  height: `${node.size}px`
                }}
                aria-label={node.label}
              />

              {/* Node Label */}
              <span
                className={`font-mono text-[11px] px-2.5 py-0.5 rounded-md backdrop-blur-md border transition-all whitespace-nowrap ${
                  node.isCentral
                    ? 'bg-[#B45309]/30 text-[#FDE047] border-[#F59E0B]/40 font-bold'
                    : 'bg-[#0C0B0A]/80 text-stone-200 border-white/10'
                } ${isSelected ? 'border-[#F59E0B] text-[#F59E0B] font-bold shadow-[0_0_8px_rgba(245,158,11,0.4)]' : ''}`}
              >
                {node.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Floating Canvas Zoom & View Controls (Right Side) */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 z-30 pointer-events-auto">
        <button
          onClick={() => handleZoom(0.2)}
          className="w-10 h-10 rounded-full glass-card border border-white/20 flex items-center justify-center text-white hover:bg-white/15 active:scale-95 transition-all shadow-lg"
          aria-label="Zoom in"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleZoom(-0.2)}
          className="w-10 h-10 rounded-full glass-card border border-white/20 flex items-center justify-center text-white hover:bg-white/15 active:scale-95 transition-all shadow-lg"
          aria-label="Zoom out"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={resetView}
          className="w-10 h-10 rounded-full glass-card border border-[#F59E0B]/40 flex items-center justify-center text-[#F59E0B] hover:bg-[#F59E0B]/20 active:scale-95 transition-all shadow-lg mt-2"
          aria-label="Reset canvas"
          title="Reset canvas"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Timeline vs Topics Toggle (Bottom Center) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center gap-1 p-1 bg-[#0C0B0A]/90 backdrop-blur-[28px] rounded-full border border-white/20 shadow-2xl">
        <button
          onClick={() => setViewMode('timeline')}
          className={`px-4 py-2 rounded-full font-mono text-xs flex items-center gap-1.5 transition-all ${
            viewMode === 'timeline'
              ? 'bg-[#F59E0B] text-[#0C0B0A] font-bold shadow-[0_0_10px_#F59E0B]'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Timeline</span>
        </button>

        <button
          onClick={() => setViewMode('topics')}
          className={`px-4 py-2 rounded-full font-mono text-xs flex items-center gap-1.5 transition-all ${
            viewMode === 'topics'
              ? 'bg-[#F59E0B] text-[#0C0B0A] font-bold shadow-[0_0_10px_#F59E0B]'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Topics</span>
        </button>
      </div>

      {/* Node Inspector Floating Drawer (When Node Selected) */}
      {selectedNode && (
        <div className="absolute top-20 left-4 sm:left-6 z-30 w-72 sm:w-80 glass-card rounded-2xl p-4 border border-white/25 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 backdrop-blur-[28px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-mono text-[10px] text-[#F59E0B] uppercase font-bold tracking-wider">
              Cluster: {selectedNode.cluster}
            </span>
            <button
              onClick={() => setSelectedNodeId(null)}
              className="text-stone-400 hover:text-white p-1 rounded hover:bg-white/10"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-sm text-white leading-snug">
              {associatedPaper?.title || selectedNode.label}
            </h4>
            <div className="flex items-center gap-2 font-mono text-[11px] text-stone-400 pt-1">
              <span>{selectedNode.year}</span>
              <span>•</span>
              <span className="text-[#F59E0B]">Rel: {selectedNode.relevance}%</span>
              <span>•</span>
              <span className="text-[#C2410C]">{selectedNode.citations} cit</span>
            </div>
          </div>

          {associatedPaper && (
            <p className="text-xs font-sans text-stone-400 leading-relaxed line-clamp-2">
              {associatedPaper.abstract}
            </p>
          )}

          <div className="pt-1 flex items-center justify-between">
            {associatedPaper && (
              <button
                onClick={() => onSelectPaper(associatedPaper.id)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#B45309] to-[#F59E0B] hover:brightness-110 text-[#0C0B0A] font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_10px_rgba(245,158,11,0.4)]"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Open Paper Details</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
