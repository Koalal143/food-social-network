from faststream.nats import NatsRouter

from src.tasks import feedback, impressions, recipes, recommendations

router = NatsRouter()


router.include_router(feedback.router)
router.include_router(impressions.router)
router.include_router(recommendations.router)
router.include_router(recipes.router)


__all__ = ["router"]
