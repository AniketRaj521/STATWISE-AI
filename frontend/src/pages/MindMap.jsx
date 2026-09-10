import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  MarkerType,
  useNodesState,
  useEdgesState,
  Panel,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import {
  Brain,
  Search,
  Sparkles,
  Upload,
  FileText,
  X,
  RotateCcw,
  Maximize2,
  Layers,
  GitBranch,
  CircleDot,
  Lightbulb,
  BookOpen,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Network,
  Download,
} from "lucide-react";

/* =========================================================
   BACKEND
========================================================= */

const API_BASE_URL = "http://127.0.0.1:8000";

/* =========================================================
   ROOT NODE
========================================================= */

function RootNode({ data }) {
  return (
    <div
      className={`relative min-w-[240px] rounded-[28px] border p-[2px]
      transition-all duration-500
      ${
        data.selected
          ? "scale-110 border-indigo-400 shadow-[0_0_65px_rgba(99,102,241,0.55)]"
          : "border-indigo-300/40 shadow-[0_0_40px_rgba(99,102,241,0.25)]"
      }`}
    >
      <Handle
        type="source"
        position={Position.Top}
        className="!h-2 !w-2 !border-0 !bg-indigo-400"
      />

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-0 !bg-indigo-400"
      />

      <div className="rounded-[26px] bg-gradient-to-br from-[#111936] via-[#202d61] to-[#111936] px-7 py-6 text-white">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/20">
          <div className="absolute h-16 w-16 animate-ping rounded-2xl bg-indigo-400/10" />

          <Brain
            size={31}
            className="relative text-indigo-300"
          />
        </div>

        <div className="text-center">
          <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.25em] text-indigo-300">
            AI Generated
          </div>

          <div className="max-w-[210px] text-lg font-bold">
            {data.label}
          </div>

          {data.description && (
            <div className="mt-2 text-xs leading-relaxed text-slate-300">
              {data.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   BRANCH NODE
========================================================= */

function BranchNode({ data }) {
  return (
    <div
      className={`group relative min-w-[205px] rounded-2xl border
      bg-white px-5 py-4 shadow-xl transition-all duration-300
      ${
        data.selected
          ? "scale-105 border-indigo-400 shadow-[0_15px_45px_rgba(79,70,229,0.25)]"
          : "border-slate-200 hover:-translate-y-1 hover:border-indigo-300"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-0 !bg-indigo-400"
      />

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-0 !bg-indigo-400"
      />

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-110">
          <Network size={19} />
        </div>

        <div className="min-w-0">
          <div className="text-[9px] font-bold uppercase tracking-widest text-indigo-500">
            Major Concept
          </div>

          <div className="mt-1 max-w-[145px] truncate text-sm font-bold text-slate-800">
            {data.label}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CHILD NODE
========================================================= */

function ChildNode({ data }) {
  return (
    <div
      className={`relative min-w-[165px] rounded-xl border
      bg-white px-4 py-3 shadow-md transition-all duration-300
      ${
        data.selected
          ? "scale-105 border-indigo-400 shadow-lg shadow-indigo-100"
          : "border-slate-200 hover:-translate-y-1 hover:border-indigo-200"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-1.5 !w-1.5 !border-0 !bg-indigo-300"
      />

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-1.5 !w-1.5 !border-0 !bg-indigo-300"
      />

      <div className="flex items-center gap-2">
        <CircleDot
          size={13}
          className="shrink-0 text-indigo-400"
        />

        <div className="min-w-0">
          <div className="text-[8px] font-semibold uppercase tracking-wider text-slate-400">
            {data.category || "Concept"}
          </div>

          <div className="mt-0.5 truncate text-xs font-semibold text-slate-700">
            {data.label}
          </div>
        </div>
      </div>
    </div>
  );
}

const nodeTypes = {
  root: RootNode,
  branch: BranchNode,
  child: ChildNode,
};

/* =========================================================
   BUILD REACT FLOW DATA FROM GEMINI RESPONSE
========================================================= */

function convertMindMapData(result) {
  const rawNodes = Array.isArray(result?.nodes)
    ? result.nodes
    : [];

  const rawEdges = Array.isArray(result?.edges)
    ? result.edges
    : [];

  if (!rawNodes.length) {
    throw new Error(
      "AI did not generate any mind-map nodes."
    );
  }

  /*
   * Find root.
   */
  const root =
    rawNodes.find(
      (node) =>
        node.type === "root" ||
        node.level === 0
    ) || rawNodes[0];

  const branches = rawNodes.filter(
    (node) =>
      node.id !== root.id &&
      (node.type === "branch" || node.level === 1)
  );

  const children = rawNodes.filter(
    (node) =>
      node.id !== root.id &&
      !branches.some((b) => b.id === node.id)
  );

  const flowNodes = [];

  /* Root */

  flowNodes.push({
    id: String(root.id),
    type: "root",
    position: {
      x: 700,
      y: 400,
    },
    data: {
      label: root.label || result.title || "Main Topic",
      description:
        root.description ||
        "AI-generated knowledge map from your uploaded material.",
      category: "Main Topic",
      level: 0,
      selected: false,
    },
  });

  /* Branches */

  const branchSpacing = 340;

  branches.forEach((branch, index) => {
    const total = branches.length;

    const angle =
      -Math.PI / 2 +
      (Math.PI * index) / Math.max(total - 1, 1);

    let x = 700 + Math.cos(angle) * 520;
    let y = 400 + Math.sin(angle) * 300;

    if (total === 1) {
      x = 700;
      y = 100;
    }

    if (index % 2 === 0) {
      x -= 60;
    } else {
      x += 60;
    }

    flowNodes.push({
      id: String(branch.id),
      type: "branch",
      position: {
        x,
        y,
      },
      data: {
        label: branch.label || "Concept",
        description: branch.description || "",
        category: branch.category || "Major Concept",
        level: 1,
        selected: false,
      },
    });
  });

  /* Children */

  const branchMap = {};

  rawEdges.forEach((edge) => {
    const source = String(edge.source);
    const target = String(edge.target);

    if (!branchMap[source]) {
      branchMap[source] = [];
    }

    branchMap[source].push(target);
  });

  children.forEach((child, index) => {
    let parentBranch = null;

    for (const branchId of Object.keys(branchMap)) {
      if (
        branchMap[branchId].includes(
          String(child.id)
        )
      ) {
        parentBranch = branchId;
        break;
      }
    }

    const parentNode = flowNodes.find(
      (node) => node.id === String(parentBranch)
    );

    const childIndex = index % 4;

    const x =
      parentNode?.position.x ??
      700;

    const y =
      (parentNode?.position.y ?? 400) +
      150 +
      childIndex * 85;

    flowNodes.push({
      id: String(child.id),
      type: "child",
      position: {
        x,
        y,
      },
      data: {
        label: child.label || "Concept",
        description: child.description || "",
        category: child.category || "Concept",
        level: 2,
        selected: false,
      },
    });
  });

  /* Edges */

  const flowEdges = rawEdges
    .map((edge, index) => ({
      id:
        edge.id ||
        `edge-${index}-${edge.source}-${edge.target}`,

      source: String(edge.source),

      target: String(edge.target),

      type: "smoothstep",

      animated: true,

      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 14,
        height: 14,
      },

      style: {
        stroke: "#a5b4fc",
        strokeWidth: 1.8,
      },
    }))
    .filter(
      (edge) =>
        flowNodes.some(
          (node) => node.id === edge.source
        ) &&
        flowNodes.some(
          (node) => node.id === edge.target
        )
    );

  return {
    title:
      result.title ||
      "AI Generated Mind Map",

    nodes: flowNodes,

    edges: flowEdges,
  };
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function MindMap() {
  const [nodes, setNodes, onNodesChange] =
    useNodesState([]);

  const [edges, setEdges, onEdgesChange] =
    useEdgesState([]);

  const [selectedNode, setSelectedNode] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [mapTitle, setMapTitle] =
    useState("Upload a learning material");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  /* =====================================================
     FILE UPLOAD
  ===================================================== */

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    await generateMindMap(file);
  };

  /* =====================================================
     GENERATE ACTUAL MIND MAP
  ===================================================== */

  const generateMindMap = async (file) => {
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError(
        "Please upload a PDF learning material."
      );
      return;
    }

    setSelectedFile(file);
    setLoading(true);
    setError("");
    setSuccess(false);
    setSelectedNode(null);

    /*
     * Clear old map immediately.
     */
    setNodes([]);
    setEdges([]);

    try {
      const formData = new FormData();

      formData.append("file", file);

      /*
       * IMPORTANT:
       *
       * This calls YOUR backend.
       *
       * It is NOT a random/demo dataset.
       */

      const response = await fetch(
        `${API_BASE_URL}/mindmap/generate`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Mind map generation failed."
        );
      }

      /*
       * Backend expected response:
       *
       * {
       *   success: true,
       *   mindmap: {
       *      title: "...",
       *      nodes: [...],
       *      edges: [...]
       *   }
       * }
       */

      const mindMapResult =
        data.mindmap ||
        data.result ||
        data;

      const converted =
        convertMindMapData(mindMapResult);

      setNodes(converted.nodes);
      setEdges(converted.edges);

      setMapTitle(converted.title);

      setSuccess(true);
    } catch (err) {
      console.error(
        "Mind map generation error:",
        err
      );

      setError(
        err.message ||
          "Unable to generate mind map."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     NODE CLICK
  ===================================================== */

  const handleNodeClick = useCallback(
    (event, node) => {
      setSelectedNode(node);

      setNodes((currentNodes) =>
        currentNodes.map((n) => ({
          ...n,

          data: {
            ...n.data,

            selected:
              n.id === node.id,
          },
        }))
      );
    },
    [setNodes]
  );

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredNodes = useMemo(() => {
    if (!search.trim()) {
      return nodes;
    }

    return nodes.map((node) => {
      const matches =
        node.data.label
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          );

      return {
        ...node,

        style: {
          opacity: matches ? 1 : 0.18,

          transition:
            "opacity 0.3s ease",
        },
      };
    });
  }, [nodes, search]);

  /* =====================================================
     RESET
  ===================================================== */

  const resetMap = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setSearch("");
    setSelectedFile(null);
    setMapTitle(
      "Upload a learning material"
    );
    setSuccess(false);
    setError("");
  };

  /* =====================================================
     STATS
  ===================================================== */

  const stats = useMemo(() => {
    return {
      total: nodes.length,

      branches: nodes.filter(
        (node) =>
          node.data.level === 1
      ).length,

      concepts: nodes.filter(
        (node) =>
          node.data.level === 2
      ).length,

      connections: edges.length,
    };
  }, [nodes, edges]);

  /* =====================================================
     DOWNLOAD MAP DATA
  ===================================================== */

  const downloadJSON = () => {
    if (!nodes.length) return;

    const exportData = {
      title: mapTitle,

      nodes: nodes.map((node) => ({
        id: node.id,
        label: node.data.label,
        category: node.data.category,
        description:
          node.data.description,
      })),

      connections: edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
      })),
    };

    const blob = new Blob(
      [
        JSON.stringify(
          exportData,
          null,
          2
        ),
      ],
      {
        type: "application/json",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;

    a.download =
      "statwise-mindmap.json";

    a.click();

    URL.revokeObjectURL(url);
  };

  /* =====================================================
     INITIAL EMPTY STATE
  ===================================================== */

  useEffect(() => {
    /*
     * Intentionally empty.
     *
     * There is NO demo mind map.
     */
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg">
              <Brain size={24} />

              <div className="absolute inset-0 animate-pulse rounded-2xl border border-indigo-300/40" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">
                  AI Mind Map
                </h1>

                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-indigo-600">
                  STATWISE AI
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Generate an interactive knowledge map from any learning PDF
              </p>
            </div>
          </div>

          {selectedFile && (
            <div className="hidden items-center gap-3 md:flex">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <FileText
                  size={14}
                  className="text-indigo-500"
                />

                <span className="max-w-[260px] truncate text-xs font-medium text-slate-600">
                  {selectedFile.name}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* =================================================
          BODY
      ================================================= */}

      <main className="mx-auto max-w-[1600px] p-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_330px]">
          {/* =================================================
              GRAPH AREA
          ================================================= */}

          <section className="relative h-[760px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {/* =================================================
                UPLOAD STATE
            ================================================= */}

            {!nodes.length &&
              !loading && (
                <div className="absolute inset-0 z-30 flex items-center justify-center p-6">
                  <div className="w-full max-w-xl">
                    <div className="rounded-[32px] border border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 p-10 text-center shadow-xl">
                      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-100 text-indigo-600">
                        <Brain size={36} />
                      </div>

                      <h2 className="text-2xl font-bold text-slate-800">
                        Create your AI Mind Map
                      </h2>

                      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
                        Upload any educational PDF and STATWISE AI will
                        analyse its actual content and transform it into an
                        interactive knowledge map.
                      </p>

                      <label className="mx-auto mt-7 flex w-fit cursor-pointer items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700">
                        <Upload size={17} />
                        Upload PDF
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          className="hidden"
                          onChange={
                            handleFileChange
                          }
                        />
                      </label>

                      <div className="mt-5 flex items-center justify-center gap-5 text-[10px] font-medium text-slate-400">
                        <span className="flex items-center gap-1">
                          <Sparkles size={12} />
                          Gemini AI
                        </span>

                        <span className="flex items-center gap-1">
                          <Network size={12} />
                          Interactive
                        </span>

                        <span className="flex items-center gap-1">
                          <BookOpen size={12} />
                          PDF based
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/90 backdrop-blur-md">
                <div className="text-center">
                  <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[30px] bg-indigo-50">
                    <div className="absolute inset-0 animate-ping rounded-[30px] bg-indigo-200/30" />

                    <Brain
                      size={42}
                      className="relative animate-pulse text-indigo-600"
                    />
                  </div>

                  <h2 className="text-xl font-bold text-slate-800">
                    AI is analysing your PDF
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Extracting concepts, topics and relationships...
                  </p>

                  <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-600">
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                    Generating knowledge graph
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {error && !loading && (
              <div className="absolute left-1/2 top-5 z-50 w-[90%] max-w-lg -translate-x-1/2">
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 shadow-lg">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-red-500"
                  />

                  <div className="flex-1">
                    <div className="text-xs font-bold text-red-700">
                      Mind map generation failed
                    </div>

                    <div className="mt-1 text-xs text-red-600">
                      {error}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setError("")
                    }
                    className="rounded-lg p-1 hover:bg-red-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* =================================================
                SEARCH
            ================================================= */}

            {nodes.length > 0 && (
              <>
                <div className="absolute left-5 top-5 z-20 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-xl">
                  <Search
                    size={15}
                    className="text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search concepts..."
                    className="w-48 bg-transparent text-xs outline-none placeholder:text-slate-400"
                  />

                  {search && (
                    <button
                      onClick={() =>
                        setSearch("")
                      }
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div className="absolute right-5 top-5 z-20 rounded-xl border border-indigo-100 bg-indigo-50/90 px-3 py-2 text-[10px] font-semibold text-indigo-600 backdrop-blur-xl">
                  Drag • Zoom • Explore
                </div>
              </>
            )}

            {/* =================================================
                REACT FLOW
            ================================================= */}

            {nodes.length > 0 && (
              <ReactFlow
                nodes={filteredNodes}
                edges={edges}
                onNodesChange={
                  onNodesChange
                }
                onEdgesChange={
                  onEdgesChange
                }
                onNodeClick={
                  handleNodeClick
                }
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{
                  padding: 0.25,
                  duration: 900,
                }}
                minZoom={0.25}
                maxZoom={1.8}
                defaultEdgeOptions={{
                  type: "smoothstep",
                  animated: true,
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 14,
                    height: 14,
                  },
                  style: {
                    stroke: "#a5b4fc",
                    strokeWidth: 1.8,
                  },
                }}
                proOptions={{
                  hideAttribution: true,
                }}
              >
                <Background
                  gap={24}
                  size={1}
                  color="#e8eaf3"
                />

                <Controls
                  showInteractive={
                    false
                  }
                  className="!bottom-5 !left-5 !rounded-xl !border !border-slate-200 !bg-white !shadow-lg"
                />

                <MiniMap
                  nodeColor={(node) => {
                    if (
                      node.type ===
                      "root"
                    ) {
                      return "#6366f1";
                    }

                    if (
                      node.type ===
                      "branch"
                    ) {
                      return "#818cf8";
                    }

                    return "#c7d2fe";
                  }}
                  maskColor="rgba(255,255,255,0.75)"
                  className="!bottom-5 !right-5 !rounded-xl !border !border-slate-200 !bg-white"
                />

                <Panel position="bottom-center">
                  <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white/95 px-5 py-3 shadow-xl backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                      <Layers
                        size={14}
                        className="text-indigo-500"
                      />

                      <span className="text-xs font-semibold text-slate-600">
                        {stats.total}
                      </span>
                    </div>

                    <div className="h-4 w-px bg-slate-200" />

                    <div className="flex items-center gap-2">
                      <GitBranch
                        size={14}
                        className="text-indigo-500"
                      />

                      <span className="text-xs font-semibold text-slate-600">
                        {stats.branches}
                      </span>
                    </div>

                    <div className="h-4 w-px bg-slate-200" />

                    <div className="flex items-center gap-2">
                      <CircleDot
                        size={14}
                        className="text-indigo-500"
                      />

                      <span className="text-xs font-semibold text-slate-600">
                        {stats.concepts}
                      </span>
                    </div>

                    <div className="h-4 w-px bg-slate-200" />

                    <div className="text-xs font-semibold text-slate-500">
                      {stats.connections} connections
                    </div>
                  </div>
                </Panel>
              </ReactFlow>
            )}
          </section>

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="space-y-4">
            {/* Upload */}

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Upload
                  size={16}
                  className="text-indigo-600"
                />

                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Learning Material
                </span>
              </div>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-indigo-700">
                <Upload size={14} />
                {nodes.length
                  ? "Upload Another PDF"
                  : "Choose PDF"}

                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={
                    handleFileChange
                  }
                />
              </label>

              {selectedFile && (
                <div className="mt-3 rounded-xl bg-slate-50 p-3">
                  <div className="flex items-start gap-2">
                    <FileText
                      size={15}
                      className="mt-0.5 shrink-0 text-indigo-500"
                    />

                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-slate-700">
                        {selectedFile.name}
                      </div>

                      <div className="mt-1 text-[10px] text-slate-400">
                        {(
                          selectedFile.size /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB
                      </div>
                    </div>

                    {success && (
                      <CheckCircle2
                        size={15}
                        className="ml-auto text-emerald-500"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Document title */}

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Generated Topic
              </div>

              <h2 className="mt-2 text-lg font-bold text-slate-800">
                {mapTitle}
              </h2>

              {success && (
                <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold text-emerald-600">
                  <CheckCircle2 size={13} />
                  Generated from uploaded PDF
                </div>
              )}
            </div>

            {/* Selected concept */}

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-gradient-to-br from-indigo-50 to-white p-5">
                <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-500">
                  <CircleDot size={13} />
                  Concept Explorer
                </div>

                <h2 className="text-lg font-bold text-slate-800">
                  {selectedNode
                    ? selectedNode.data.label
                    : "Select a concept"}
                </h2>
              </div>

              <div className="p-5">
                {selectedNode ? (
                  <>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <Lightbulb
                          size={13}
                        />
                        AI Insight
                      </div>

                      <p className="text-sm leading-6 text-slate-600">
                        {selectedNode.data
                          .description ||
                          "This concept was identified from the uploaded learning material."}
                      </p>
                    </div>

                    <div className="mt-4 rounded-xl bg-indigo-50 p-3">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">
                        Category
                      </div>

                      <div className="mt-1 text-xs font-bold text-indigo-700">
                        {selectedNode.data
                          .category ||
                          "Concept"}
                      </div>
                    </div>

                    <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-indigo-700">
                      <BookOpen
                        size={14}
                      />
                      Learn this concept
                      <ArrowRight
                        size={14}
                      />
                    </button>
                  </>
                ) : (
                  <div className="py-6 text-center">
                    <Network
                      size={28}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-xs leading-5 text-slate-400">
                      Click any generated node to explore its meaning.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}

            {nodes.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Map Intelligence
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-indigo-50 p-3">
                    <div className="text-[9px] text-indigo-400">
                      Nodes
                    </div>

                    <div className="mt-1 text-xl font-bold text-indigo-700">
                      {stats.total}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-violet-50 p-3">
                    <div className="text-[9px] text-violet-400">
                      Connections
                    </div>

                    <div className="mt-1 text-xl font-bold text-violet-700">
                      {stats.connections}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI insight */}

            {nodes.length > 0 && (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#111936] via-[#202d61] to-[#111936] p-5 text-white shadow-xl">
                <div className="relative">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles
                      size={16}
                      className="text-indigo-300"
                    />

                    <span className="text-xs font-bold">
                      AI Knowledge Extraction
                    </span>
                  </div>

                  <p className="text-xs leading-5 text-slate-300">
                    This map was generated from the content of your uploaded
                    learning material. The concepts and relationships are
                    derived dynamically for this document.
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}

            {nodes.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={resetMap}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <RotateCcw size={14} />
                  New Map
                </button>

                <button
                  onClick={
                    downloadJSON
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <Download size={14} />
                  Export
                </button>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}