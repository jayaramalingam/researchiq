from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, desc

from app.database.session import get_db
from app.models.research_project import ResearchProject
from app.models.paper import Paper
from app.models.project_paper import ProjectPaper
from app.models.paper_analysis import PaperAnalysis
from app.models.paper_source import PaperSource
from app.models.paper_relationship import PaperRelationship, RelationshipType
from app.models.research_insight import ResearchInsight, InsightType
from app.schemas.project import ProjectCreate, ProjectResponse
from app.schemas.paper import PaperResponse, ProjectPaperAttach, ProjectPaperResponse

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(project_in: ProjectCreate, db: Session = Depends(get_db)):
    project = ResearchProject(
        title=project_in.title,
        research_question=project_in.research_question,
        description=project_in.description,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    stmt = select(ResearchProject).order_by(desc(ResearchProject.created_at))
    projects = db.scalars(stmt).all()
    return projects


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: UUID, db: Session = Depends(get_db)):
    project = db.get(ResearchProject, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found",
        )
    return project


@router.post(
    "/{project_id}/papers/{paper_id}",
    response_model=ProjectPaperResponse,
    status_code=status.HTTP_201_CREATED,
)
def attach_paper_to_project(
    project_id: UUID,
    paper_id: UUID,
    attach_data: Optional[ProjectPaperAttach] = None,
    db: Session = Depends(get_db),
):
    project = db.get(ResearchProject, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found",
        )

    paper = db.get(Paper, paper_id)
    if not paper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Paper {paper_id} not found",
        )

    existing = db.scalars(
        select(ProjectPaper).where(
            ProjectPaper.project_id == project_id,
            ProjectPaper.paper_id == paper_id,
        )
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Paper is already attached to this project",
        )

    relevance_score = attach_data.relevance_score if attach_data else None
    rank = attach_data.rank if attach_data else None
    selected = attach_data.selected if attach_data else True

    project_paper = ProjectPaper(
        project_id=project_id,
        paper_id=paper_id,
        relevance_score=relevance_score,
        rank=rank,
        selected=selected,
    )
    db.add(project_paper)
    db.commit()
    db.refresh(project_paper)

    return ProjectPaperResponse(
        id=project_paper.id,
        project_id=project_paper.project_id,
        paper_id=project_paper.paper_id,
        relevance_score=project_paper.relevance_score,
        rank=project_paper.rank,
        selected=project_paper.selected,
        added_at=project_paper.added_at,
        paper=PaperResponse.model_validate(paper),
    )


@router.get("/{project_id}/papers", response_model=List[ProjectPaperResponse])
def get_project_papers(project_id: UUID, db: Session = Depends(get_db)):
    project = db.get(ResearchProject, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found",
        )

    stmt = select(ProjectPaper).where(ProjectPaper.project_id == project_id)
    project_papers = db.scalars(stmt).all()

    response = []
    for pp in project_papers:
        response.append(
            ProjectPaperResponse(
                id=pp.id,
                project_id=pp.project_id,
                paper_id=pp.paper_id,
                relevance_score=pp.relevance_score,
                rank=pp.rank,
                selected=pp.selected,
                added_at=pp.added_at,
                paper=PaperResponse.model_validate(pp.paper) if pp.paper else None,
            )
        )
    return response


@router.post("/{project_id}/demo-data", status_code=status.HTTP_201_CREATED)
def seed_demo_data(project_id: UUID, db: Session = Depends(get_db)):
    project = db.get(ResearchProject, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found",
        )

    DEMO_PAPERS_DATA = [
        {
            "doi": "10.1109/TII.2023.001",
            "title": "Computer Vision for Waste Classification",
            "abstract": "A comprehensive benchmark and analysis of modern computer vision techniques applied to automated municipal waste classification.",
            "publication_year": 2023,
            "venue": "IEEE Transactions on Industrial Informatics",
            "source": "IEEE",
            "citation_count": 42,
            "is_open_access": True,
            "authors": ["A. Sharma", "B. Patel"],
            "relevance_score": 95.0,
            "rank": 1,
        },
        {
            "doi": "10.1109/CVPRW.2024.002",
            "title": "Transformer-Based Waste Sorting",
            "abstract": "Introducing Vision Transformers (ViT) to high-speed conveyor belt waste sorting systems for fine-grained material discrimination.",
            "publication_year": 2024,
            "venue": "CVPR Workshops",
            "source": "IEEE",
            "citation_count": 28,
            "is_open_access": True,
            "authors": ["C. Lee", "D. Kim"],
            "relevance_score": 90.0,
            "rank": 2,
        },
        {
            "doi": "10.1109/LEMB.2024.003",
            "title": "Edge AI for Industrial Waste Detection",
            "abstract": "Deploying quantized lightweight neural networks on edge devices for real-time sorting in resource-constrained recycling facilities.",
            "publication_year": 2024,
            "venue": "IEEE Embedded Systems Letters",
            "source": "IEEE",
            "citation_count": 19,
            "is_open_access": False,
            "authors": ["E. Rodriguez", "F. Garcia"],
            "relevance_score": 85.0,
            "rank": 3,
        },
        {
            "doi": "10.1016/j.rcim.2025.004",
            "title": "Lightweight Object Detection for Recycling",
            "abstract": "A lightweight YOLO variant optimized for low-latency multi-class recycling object detection on high-speed industrial belts.",
            "publication_year": 2025,
            "venue": "Robotics and Computer-Integrated Manufacturing",
            "source": "ScienceDirect",
            "citation_count": 8,
            "is_open_access": True,
            "authors": ["G. Zhang", "H. Wang"],
            "relevance_score": 80.0,
            "rank": 4,
        },
        {
            "doi": "10.5555/NEURIPS.2025.005",
            "title": "Self-Supervised Learning for Waste Recognition",
            "abstract": "Leveraging unlabelled industrial waste images with self-supervised contrastive learning to reduce annotation costs by 80%.",
            "publication_year": 2025,
            "venue": "NeurIPS",
            "source": "NeurIPS",
            "citation_count": 12,
            "is_open_access": True,
            "authors": ["I. Müller", "J. Schmidt"],
            "relevance_score": 75.0,
            "rank": 5,
        },
    ]

    created_papers = []
    for paper_info in DEMO_PAPERS_DATA:
        paper = db.scalars(
            select(Paper).where(Paper.doi == paper_info["doi"])
        ).first()
        if not paper:
            paper = Paper(
                doi=paper_info["doi"],
                title=paper_info["title"],
                abstract=paper_info["abstract"],
                publication_year=paper_info["publication_year"],
                venue=paper_info["venue"],
                source=paper_info["source"],
                citation_count=paper_info["citation_count"],
                is_open_access=paper_info["is_open_access"],
                authors=paper_info["authors"],
            )
            db.add(paper)
            db.flush()

        created_papers.append((paper, paper_info))

        # Check project paper association
        pp = db.scalars(
            select(ProjectPaper).where(
                ProjectPaper.project_id == project_id,
                ProjectPaper.paper_id == paper.id,
            )
        ).first()

        if not pp:
            pp = ProjectPaper(
                project_id=project_id,
                paper_id=paper.id,
                relevance_score=paper_info["relevance_score"],
                rank=paper_info["rank"],
                selected=True,
            )
            db.add(pp)

        # Seed PaperSource for provenance tracking if not present
        existing_src = db.scalars(
            select(PaperSource).where(
                PaperSource.paper_id == paper.id,
                PaperSource.source_name == "Semantic Scholar",
            )
        ).first()

        if not existing_src:
            src = PaperSource(
                paper_id=paper.id,
                source_name="Semantic Scholar",
                source_identifier=paper_info.get("doi") or f"S2-{str(paper.id)[:8]}",
                source_url=f"https://doi.org/{paper_info.get('doi')}" if paper_info.get("doi") else "https://semanticscholar.org",
            )
            db.add(src)

    db.flush()

    # Define relationships between paper indexes (0-indexed)
    # 0: CV Waste Classif, 1: Transformer Waste Sorting, 2: Edge AI, 3: Lightweight YOLO, 4: Self-Supervised
    RELATIONSHIPS_DATA = [
        (0, 1, RelationshipType.extends, 0.90, "Transformer architecture extends basic CV classification model."),
        (1, 2, RelationshipType.uses, 0.85, "Edge deployment uses quantized transformer weights."),
        (0, 3, RelationshipType.similar, 0.75, "Both focus on vision-based object detection for waste."),
        (2, 3, RelationshipType.improves, 0.88, "Lightweight detection improves throughput on edge hardware."),
        (4, 1, RelationshipType.contradicts, 0.65, "Self-supervised feature representation challenges fully-supervised ViT assumptions."),
    ]

    for src_idx, tgt_idx, rel_type, strength, explanation in RELATIONSHIPS_DATA:
        src_paper = created_papers[src_idx][0]
        tgt_paper = created_papers[tgt_idx][0]

        rel = db.scalars(
            select(PaperRelationship).where(
                PaperRelationship.source_paper_id == src_paper.id,
                PaperRelationship.target_paper_id == tgt_paper.id,
                PaperRelationship.relationship_type == rel_type,
            )
        ).first()

        if not rel:
            rel = PaperRelationship(
                source_paper_id=src_paper.id,
                target_paper_id=tgt_paper.id,
                relationship_type=rel_type,
                strength=strength,
                explanation=explanation,
            )
            db.add(rel)

    # Deterministic Demo Insights & Gaps
    DEMO_INSIGHTS_DATA = [
        {
            "type": InsightType.gap,
            "title": "Limited Fine-Grained Material Distinctions Under High-Speed Conveyor Belt Occlusions",
            "description": "Current vision models struggle with severe occlusions and dirty/crushed items at conveyer speeds >2.5m/s without active optical sensor triangulation.",
            "evidence": "Extracted from stated limitations across Computer Vision and Transformer-Based Waste Sorting benchmark evaluations.",
            "confidence": 0.92,
        },
        {
            "type": InsightType.gap,
            "title": "Edge Deployment Quantization Degrades Low-Contrast E-Waste Recognition",
            "description": "Quantizing deep models for edge inference on low-power microcontrollers causes an 18% accuracy drop on unlabelled mixed material fractions.",
            "evidence": "Observed in Edge AI for Industrial Waste Detection and Lightweight Object Detection ablation studies.",
            "confidence": 0.88,
        },
        {
            "type": InsightType.innovation,
            "title": "Self-Supervised Representation Distillation for Unlabelled Recyclable Streams",
            "description": "Contrastive learning models pre-trained on unlabelled material streams reduce the downstream manual annotation burden by over 80%.",
            "evidence": "Verified in Self-Supervised Learning for Waste Recognition benchmarks.",
            "confidence": 0.95,
        },
        {
            "type": InsightType.contradiction,
            "title": "Fully Supervised ViT vs Lightweight CNNs in Latency-Critical Industrial Environments",
            "description": "Vision Transformers achieve superior feature discrimination but exceed edge latency budgets compared to quantized YOLO networks.",
            "evidence": "Comparative inference latency analysis between Transformer-Based Waste Sorting and Lightweight Object Detection.",
            "confidence": 0.85,
        },
        {
            "type": InsightType.opportunity,
            "title": "Hybrid Edge-Cloud Pipeline with Active Optical Pre-filtering",
            "description": "Combining lightweight edge YOLO filtering with cloud-assisted self-supervised transformer verification for anomalous material classification.",
            "evidence": "Synergy between Edge AI deployment and self-supervised feature embeddings.",
            "confidence": 0.90,
        },
    ]

    for insight_data in DEMO_INSIGHTS_DATA:
        existing_insight = db.scalars(
            select(ResearchInsight).where(
                ResearchInsight.project_id == project_id,
                ResearchInsight.title == insight_data["title"],
            )
        ).first()

        if not existing_insight:
            insight = ResearchInsight(
                project_id=project_id,
                type=insight_data["type"],
                title=insight_data["title"],
                description=insight_data["description"],
                evidence=insight_data["evidence"],
                confidence=insight_data["confidence"],
            )
            db.add(insight)

    # Demo Paper Analyses
    DEMO_ANALYSES_DATA = [
        {
            "summary": "Systematic benchmarking of deep CNN and ViT models on multi-class municipal recyclable waste datasets.",
            "problem": "High misclassification rates on distorted, soiled, and overlapping recyclable materials on high-speed lines.",
            "methodology": "Ensemble deep residual networks with custom data augmentation tailored to deformation artifacts.",
            "dataset": "Municipal Solid Waste Benchmark (MSW-50K)",
            "results": "Achieved 94.6% classification accuracy at 30 FPS inference.",
            "limitations": "Performance degrades on heavy surface occlusions and non-rigid plastic deformation.",
            "contribution": "Standardized benchmark and baseline open dataset for waste sorting AI.",
            "future_work": "Exploration of active hyperspectral lighting and multi-modal sensory fusion.",
            "ai_model": "ResNet-50 / YOLOv8",
            "confidence": 0.94,
        },
        {
            "summary": "Vision Transformer architecture applied to fine-grained recyclable material identification.",
            "problem": "Subtle visual differences between PET, HDPE, and PP polymer types undetectable by standard CNNs.",
            "methodology": "Spatial-spectral self-attention transformer trained with patch-level tokenization.",
            "dataset": "PolymerVision-10K Dataset",
            "results": "97.2% top-1 accuracy across 12 polymer categories.",
            "limitations": "Requires high GPU memory; latency too high for sub-50ms embedded sorting actuators.",
            "contribution": "Novel patch attention mechanism specifically isolating specular reflection patterns.",
            "future_work": "Knowledge distillation into edge-friendly student networks.",
            "ai_model": "ViT-B/16",
            "confidence": 0.96,
        },
        {
            "summary": "Quantized deep neural networks optimized for low-power edge microcontrollers in recycling plants.",
            "problem": "Cloud inference round-trip latency exceeds 150ms, violating pneumatic ejection timing constraints.",
            "methodology": "INT8 post-training quantization and structural pruning applied to lightweight backbones.",
            "dataset": "EdgeWaste Micro Dataset (15K frames)",
            "results": "Sub-35ms inference latency on ARM Cortex-M7 with 91.4% mAP.",
            "limitations": "Minor degradation in low-light ambient conditions.",
            "contribution": "First fully embedded sorting controller running under 5W power envelope.",
            "future_work": "Solar energy harvesting integration and neuromorphic event-based sensing.",
            "ai_model": "MobileNetV3-Quantized",
            "confidence": 0.91,
        },
        {
            "summary": "Modified YOLO architecture designed for ultra-high throughput continuous conveyor object detection.",
            "problem": "High conveyor speeds (>3.5 m/s) cause motion blur and dropped frame detections in conventional models.",
            "methodology": "Decoupled lightweight detection head with bidirectional feature pyramid networks.",
            "dataset": "HighSpeed-Recycle-2025",
            "results": "120 FPS throughput with 88.9% mAP@0.5.",
            "limitations": "Higher false positive rate on overlapping transparent plastic films.",
            "contribution": "Real-time edge detector maintaining 90%+ precision under extreme conveyor velocities.",
            "future_work": "Integration with pneumatic delta robot control loop.",
            "ai_model": "YOLO-Nano-Custom",
            "confidence": 0.89,
        },
        {
            "summary": "Contrastive representation learning using unlabelled waste footage to drastically minimize manual annotation.",
            "problem": "Annotating hundreds of thousands of waste images across regional waste streams is prohibitively expensive.",
            "methodology": "Momentum contrast with domain-specific color jitter and geometric invariant pretext tasks.",
            "dataset": "Unlabelled Stream-100K + 2K labelled fine-tuning",
            "results": "Achieved 93.1% accuracy using only 20% of labelled training data.",
            "limitations": "Pre-training phase requires substantial multi-GPU compute resources.",
            "contribution": "Demonstrates practical transfer learning for zero-shot domain adaptation across facilities.",
            "future_work": "Semi-supervised active learning loops integrated into live sorting facilities.",
            "ai_model": "SimCLR-v2",
            "confidence": 0.93,
        },
    ]

    for idx, analysis_payload in enumerate(DEMO_ANALYSES_DATA):
        if idx < len(created_papers):
            paper_obj = created_papers[idx][0]
            existing_analysis = db.scalars(
                select(PaperAnalysis).where(PaperAnalysis.paper_id == paper_obj.id)
            ).first()

            if not existing_analysis:
                analysis = PaperAnalysis(
                    paper_id=paper_obj.id,
                    summary=analysis_payload["summary"],
                    problem=analysis_payload["problem"],
                    methodology=analysis_payload["methodology"],
                    dataset=analysis_payload["dataset"],
                    results=analysis_payload["results"],
                    limitations=analysis_payload["limitations"],
                    contribution=analysis_payload["contribution"],
                    future_work=analysis_payload["future_work"],
                    ai_model=analysis_payload["ai_model"],
                    confidence=analysis_payload["confidence"],
                )
                db.add(analysis)

    db.commit()

    return {
        "message": "Demo data populated successfully",
        "project_id": str(project_id),
        "papers_count": len(created_papers),
        "relationships_count": len(RELATIONSHIPS_DATA),
        "insights_count": len(DEMO_INSIGHTS_DATA),
        "analyses_count": len(DEMO_ANALYSES_DATA),
    }

