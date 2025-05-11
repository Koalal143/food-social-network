"""
Type annotations for s3 service ServiceResource.

[Documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/)

Copyright 2025 Vlad Emelianov

Usage::

    ```python
    from aiobotocore.session import get_session

    from types_aiobotocore_s3.service_resource import S3ServiceResource
    import types_aiobotocore_s3.service_resource as s3_resources

    session = get_session()
    async with session.resource("s3") as resource:
        resource: S3ServiceResource

        my_bucket: s3_resources.Bucket = resource.Bucket(...)
        my_bucket_acl: s3_resources.BucketAcl = resource.BucketAcl(...)
        my_bucket_cors: s3_resources.BucketCors = resource.BucketCors(...)
        my_bucket_lifecycle: s3_resources.BucketLifecycle = resource.BucketLifecycle(...)
        my_bucket_lifecycle_configuration: s3_resources.BucketLifecycleConfiguration = resource.BucketLifecycleConfiguration(...)
        my_bucket_logging: s3_resources.BucketLogging = resource.BucketLogging(...)
        my_bucket_notification: s3_resources.BucketNotification = resource.BucketNotification(...)
        my_bucket_policy: s3_resources.BucketPolicy = resource.BucketPolicy(...)
        my_bucket_request_payment: s3_resources.BucketRequestPayment = resource.BucketRequestPayment(...)
        my_bucket_tagging: s3_resources.BucketTagging = resource.BucketTagging(...)
        my_bucket_versioning: s3_resources.BucketVersioning = resource.BucketVersioning(...)
        my_bucket_website: s3_resources.BucketWebsite = resource.BucketWebsite(...)
        my_multipart_upload: s3_resources.MultipartUpload = resource.MultipartUpload(...)
        my_multipart_upload_part: s3_resources.MultipartUploadPart = resource.MultipartUploadPart(...)
        my_object: s3_resources.Object = resource.Object(...)
        my_object_acl: s3_resources.ObjectAcl = resource.ObjectAcl(...)
        my_object_summary: s3_resources.ObjectSummary = resource.ObjectSummary(...)
        my_object_version: s3_resources.ObjectVersion = resource.ObjectVersion(...)
```
"""

from __future__ import annotations

import sys
from datetime import datetime
from typing import Any, NoReturn

from aioboto3.resources.base import AIOBoto3ServiceResource
from aioboto3.resources.collection import AIOResourceCollection
from aiobotocore.client import AioBaseClient

from .client import S3Client
from .literals import (
    ArchiveStatusType,
    BucketVersioningStatusType,
    ChecksumAlgorithmType,
    ChecksumTypeType,
    MFADeleteStatusType,
    ObjectLockLegalHoldStatusType,
    ObjectLockModeType,
    ObjectStorageClassType,
    PayerType,
    ReplicationStatusType,
    ServerSideEncryptionType,
    StorageClassType,
    TransitionDefaultMinimumObjectSizeType,
)
from .type_defs import (
    AbortMultipartUploadOutputTypeDef,
    AbortMultipartUploadRequestMultipartUploadAbortTypeDef,
    CompleteMultipartUploadRequestMultipartUploadCompleteTypeDef,
    CopyObjectOutputTypeDef,
    CopyObjectRequestObjectCopyFromTypeDef,
    CopyObjectRequestObjectSummaryCopyFromTypeDef,
    CopySourceTypeDef,
    CORSRuleOutputTypeDef,
    CreateBucketOutputTypeDef,
    CreateBucketRequestBucketCreateTypeDef,
    CreateBucketRequestServiceResourceCreateBucketTypeDef,
    CreateMultipartUploadRequestObjectInitiateMultipartUploadTypeDef,
    CreateMultipartUploadRequestObjectSummaryInitiateMultipartUploadTypeDef,
    DeleteBucketCorsRequestBucketCorsDeleteTypeDef,
    DeleteBucketLifecycleRequestBucketLifecycleConfigurationDeleteTypeDef,
    DeleteBucketLifecycleRequestBucketLifecycleDeleteTypeDef,
    DeleteBucketPolicyRequestBucketPolicyDeleteTypeDef,
    DeleteBucketRequestBucketDeleteTypeDef,
    DeleteBucketTaggingRequestBucketTaggingDeleteTypeDef,
    DeleteBucketWebsiteRequestBucketWebsiteDeleteTypeDef,
    DeleteObjectOutputTypeDef,
    DeleteObjectRequestObjectDeleteTypeDef,
    DeleteObjectRequestObjectSummaryDeleteTypeDef,
    DeleteObjectRequestObjectVersionDeleteTypeDef,
    DeleteObjectsOutputTypeDef,
    DeleteObjectsRequestBucketDeleteObjectsTypeDef,
    ErrorDocumentTypeDef,
    FileobjTypeDef,
    GetObjectOutputTypeDef,
    GetObjectRequestObjectGetTypeDef,
    GetObjectRequestObjectSummaryGetTypeDef,
    GetObjectRequestObjectVersionGetTypeDef,
    GrantTypeDef,
    HeadObjectOutputTypeDef,
    HeadObjectRequestObjectVersionHeadTypeDef,
    IndexDocumentTypeDef,
    InitiatorTypeDef,
    LambdaFunctionConfigurationOutputTypeDef,
    LifecycleRuleOutputTypeDef,
    LoggingEnabledOutputTypeDef,
    OwnerTypeDef,
    PutBucketAclRequestBucketAclPutTypeDef,
    PutBucketCorsRequestBucketCorsPutTypeDef,
    PutBucketLifecycleConfigurationOutputTypeDef,
    PutBucketLifecycleConfigurationRequestBucketLifecycleConfigurationPutTypeDef,
    PutBucketLifecycleRequestBucketLifecyclePutTypeDef,
    PutBucketLoggingRequestBucketLoggingPutTypeDef,
    PutBucketNotificationConfigurationRequestBucketNotificationPutTypeDef,
    PutBucketPolicyRequestBucketPolicyPutTypeDef,
    PutBucketRequestPaymentRequestBucketRequestPaymentPutTypeDef,
    PutBucketTaggingRequestBucketTaggingPutTypeDef,
    PutBucketVersioningRequestBucketVersioningEnableTypeDef,
    PutBucketVersioningRequestBucketVersioningPutTypeDef,
    PutBucketVersioningRequestBucketVersioningSuspendTypeDef,
    PutBucketWebsiteRequestBucketWebsitePutTypeDef,
    PutObjectAclOutputTypeDef,
    PutObjectAclRequestObjectAclPutTypeDef,
    PutObjectOutputTypeDef,
    PutObjectRequestBucketPutObjectTypeDef,
    PutObjectRequestObjectPutTypeDef,
    PutObjectRequestObjectSummaryPutTypeDef,
    QueueConfigurationOutputTypeDef,
    RedirectAllRequestsToTypeDef,
    RestoreObjectOutputTypeDef,
    RestoreObjectRequestObjectRestoreObjectTypeDef,
    RestoreObjectRequestObjectSummaryRestoreObjectTypeDef,
    RestoreStatusTypeDef,
    RoutingRuleTypeDef,
    RuleOutputTypeDef,
    TagTypeDef,
    TopicConfigurationOutputTypeDef,
    UploadPartCopyOutputTypeDef,
    UploadPartCopyRequestMultipartUploadPartCopyFromTypeDef,
    UploadPartOutputTypeDef,
    UploadPartRequestMultipartUploadPartUploadTypeDef,
)

try:
    from boto3.resources.base import ResourceMeta
    from boto3.s3.transfer import TransferConfig
except ImportError:
    from builtins import object as TransferConfig  # type: ignore[assignment]
if sys.version_info >= (3, 9):
    from collections.abc import AsyncIterator, Awaitable, Callable, Sequence
else:
    from collections.abc import AsyncIterator, Awaitable, Callable, Sequence
if sys.version_info >= (3, 12):
    from typing import Literal, Unpack
else:
    from typing import Literal

    from typing_extensions import Unpack


__all__ = (
    "Bucket",
    "BucketAcl",
    "BucketCors",
    "BucketLifecycle",
    "BucketLifecycleConfiguration",
    "BucketLogging",
    "BucketMultipartUploadsCollection",
    "BucketNotification",
    "BucketObjectVersionsCollection",
    "BucketObjectsCollection",
    "BucketPolicy",
    "BucketRequestPayment",
    "BucketTagging",
    "BucketVersioning",
    "BucketWebsite",
    "MultipartUpload",
    "MultipartUploadPart",
    "MultipartUploadPartsCollection",
    "Object",
    "ObjectAcl",
    "ObjectSummary",
    "ObjectVersion",
    "S3ServiceResource",
    "ServiceResourceBucketsCollection",
)


class ServiceResourceBucketsCollection(AIOResourceCollection):
    """
    [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/buckets.html#S3.ServiceResource.buckets)
    [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#serviceresourcebucketscollection)
    """

    def all(self) -> ServiceResourceBucketsCollection:
        """
        Get all items from the collection, optionally with a custom page size and item
        count limit.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/buckets.html#S3.ServiceResource.all)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#serviceresourcebucketscollection)
        """

    def filter(  # type: ignore[override]
        self,
        *,
        MaxBuckets: int = ...,
        ContinuationToken: str = ...,
        Prefix: str = ...,
        BucketRegion: str = ...,
    ) -> ServiceResourceBucketsCollection:
        """
        Get items from the collection, passing keyword arguments along as parameters to
        the underlying service operation, which are typically used to filter the
        results.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/buckets.html#filter)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#serviceresourcebucketscollection)
        """

    def limit(self, count: int) -> ServiceResourceBucketsCollection:
        """
        Return at most this many Buckets.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/buckets.html#limit)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#serviceresourcebucketscollection)
        """

    def page_size(self, count: int) -> ServiceResourceBucketsCollection:
        """
        Fetch at most this many Buckets per service request.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/buckets.html#page_size)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#serviceresourcebucketscollection)
        """

    def pages(  # type: ignore[override]
        self,
    ) -> AsyncIterator[list[Bucket]]:
        """
        A generator which yields pages of Buckets.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/buckets.html#pages)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#serviceresourcebucketscollection)
        """

    def __iter__(self) -> NoReturn:
        """
        A generator which yields Buckets.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/buckets.html#__iter__)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#serviceresourcebucketscollection)
        """

    def __aiter__(self) -> AsyncIterator[Bucket]:
        """
        A generator which yields Buckets.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/buckets.html#__iter__)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#serviceresourcebucketscollection)
        """


class BucketMultipartUploadsCollection(AIOResourceCollection):
    """
    [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/multipart_uploads.html#S3.Bucket.multipart_uploads)
    [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketmultipart_uploads)
    """

    def all(self) -> BucketMultipartUploadsCollection:
        """
        Get all items from the collection, optionally with a custom page size and item
        count limit.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/multipart_uploads.html#S3.Bucket.all)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketmultipart_uploads)
        """

    def filter(  # type: ignore[override]
        self,
        *,
        Delimiter: str = ...,
        EncodingType: Literal["url"] = ...,
        KeyMarker: str = ...,
        MaxUploads: int = ...,
        Prefix: str = ...,
        UploadIdMarker: str = ...,
        ExpectedBucketOwner: str = ...,
        RequestPayer: Literal["requester"] = ...,
    ) -> BucketMultipartUploadsCollection:
        """
        Get items from the collection, passing keyword arguments along as parameters to
        the underlying service operation, which are typically used to filter the
        results.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/multipart_uploads.html#filter)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketmultipart_uploads)
        """

    def limit(self, count: int) -> BucketMultipartUploadsCollection:
        """
        Return at most this many MultipartUploads.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/multipart_uploads.html#limit)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketmultipart_uploads)
        """

    def page_size(self, count: int) -> BucketMultipartUploadsCollection:
        """
        Fetch at most this many MultipartUploads per service request.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/multipart_uploads.html#page_size)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketmultipart_uploads)
        """

    def pages(  # type: ignore[override]
        self,
    ) -> AsyncIterator[list[MultipartUpload]]:
        """
        A generator which yields pages of MultipartUploads.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/multipart_uploads.html#pages)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketmultipart_uploads)
        """

    def __iter__(self) -> NoReturn:
        """
        A generator which yields MultipartUploads.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/multipart_uploads.html#__iter__)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketmultipart_uploads)
        """

    def __aiter__(self) -> AsyncIterator[MultipartUpload]:
        """
        A generator which yields MultipartUploads.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/multipart_uploads.html#__iter__)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketmultipart_uploads)
        """


class BucketObjectVersionsCollection(AIOResourceCollection):
    """
    [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/object_versions.html#S3.Bucket.object_versions)
    [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketobject_versions)
    """

    def all(self) -> BucketObjectVersionsCollection:
        """
        Get all items from the collection, optionally with a custom page size and item
        count limit.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/object_versions.html#S3.Bucket.all)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketobject_versions)
        """

    def filter(  # type: ignore[override]
        self,
        *,
        Delimiter: str = ...,
        EncodingType: Literal["url"] = ...,
        KeyMarker: str = ...,
        MaxKeys: int = ...,
        Prefix: str = ...,
        VersionIdMarker: str = ...,
        ExpectedBucketOwner: str = ...,
        RequestPayer: Literal["requester"] = ...,
        OptionalObjectAttributes: Sequence[Literal["RestoreStatus"]] = ...,
    ) -> BucketObjectVersionsCollection:
        """
        Get items from the collection, passing keyword arguments along as parameters to
        the underlying service operation, which are typically used to filter the
        results.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/object_versions.html#filter)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketobject_versions)
        """

    async def delete(
        self,
        *,
        MFA: str = ...,
        RequestPayer: Literal["requester"] = ...,
        BypassGovernanceRetention: bool = ...,
        ExpectedBucketOwner: str = ...,
        ChecksumAlgorithm: ChecksumAlgorithmType = ...,
    ) -> list[DeleteObjectsOutputTypeDef]:
        """
        Batch method.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/object_versions.html#delete)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketobject_versions)
        """

    def limit(self, count: int) -> BucketObjectVersionsCollection:
        """
        Return at most this many ObjectVersions.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/object_versions.html#limit)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketobject_versions)
        """

    def page_size(self, count: int) -> BucketObjectVersionsCollection:
        """
        Fetch at most this many ObjectVersions per service request.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/object_versions.html#page_size)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketobject_versions)
        """

    def pages(  # type: ignore[override]
        self,
    ) -> AsyncIterator[list[ObjectVersion]]:
        """
        A generator which yields pages of ObjectVersions.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/object_versions.html#pages)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketobject_versions)
        """

    def __iter__(self) -> NoReturn:
        """
        A generator which yields ObjectVersions.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/object_versions.html#__iter__)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketobject_versions)
        """

    def __aiter__(self) -> AsyncIterator[ObjectVersion]:
        """
        A generator which yields ObjectVersions.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/object_versions.html#__iter__)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketobject_versions)
        """


class BucketObjectsCollection(AIOResourceCollection):
    """
    [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/objects.html#S3.Bucket.objects)
    [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketobjects)
    """

    def all(self) -> BucketObjectsCollection:
        """
        Get all items from the collection, optionally with a custom page size and item
        count limit.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/objects.html#S3.Bucket.all)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketobjects)
        """

    def filter(  # type: ignore[override]
        self,
        *,
        Delimiter: str = ...,
        EncodingType: Literal["url"] = ...,
        Marker: str = ...,
        MaxKeys: int = ...,
        Prefix: str = ...,
        RequestPayer: Literal["requester"] = ...,
        ExpectedBucketOwner: str = ...,
        OptionalObjectAttributes: Sequence[Literal["RestoreStatus"]] = ...,
    ) -> BucketObjectsCollection:
        """
        Get items from the collection, passing keyword arguments along as parameters to
        the underlying service operation, which are typically used to filter the
        results.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/objects.html#filter)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketobjects)
        """

    async def delete(
        self,
        *,
        MFA: str = ...,
        RequestPayer: Literal["requester"] = ...,
        BypassGovernanceRetention: bool = ...,
        ExpectedBucketOwner: str = ...,
        ChecksumAlgorithm: ChecksumAlgorithmType = ...,
    ) -> list[DeleteObjectsOutputTypeDef]:
        """
        Batch method.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/objects.html#delete)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketobjects)
        """

    def limit(self, count: int) -> BucketObjectsCollection:
        """
        Return at most this many ObjectSummarys.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/objects.html#limit)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketobjects)
        """

    def page_size(self, count: int) -> BucketObjectsCollection:
        """
        Fetch at most this many ObjectSummarys per service request.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/objects.html#page_size)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketobjects)
        """

    def pages(  # type: ignore[override]
        self,
    ) -> AsyncIterator[list[ObjectSummary]]:
        """
        A generator which yields pages of ObjectSummarys.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/objects.html#pages)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketobjects)
        """

    def __iter__(self) -> NoReturn:
        """
        A generator which yields ObjectSummarys.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/objects.html#__iter__)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketobjects)
        """

    def __aiter__(self) -> AsyncIterator[ObjectSummary]:
        """
        A generator which yields ObjectSummarys.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/objects.html#__iter__)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketobjects)
        """


class MultipartUploadPartsCollection(AIOResourceCollection):
    """
    [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/multipartupload/parts.html#S3.MultipartUpload.parts)
    [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#multipartuploadparts)
    """

    def all(self) -> MultipartUploadPartsCollection:
        """
        Get all items from the collection, optionally with a custom page size and item
        count limit.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/multipartupload/parts.html#S3.MultipartUpload.all)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#multipartuploadparts)
        """

    def filter(  # type: ignore[override]
        self,
        *,
        MaxParts: int = ...,
        PartNumberMarker: int = ...,
        RequestPayer: Literal["requester"] = ...,
        ExpectedBucketOwner: str = ...,
        SSECustomerAlgorithm: str = ...,
        SSECustomerKey: str | bytes = ...,
    ) -> MultipartUploadPartsCollection:
        """
        Get items from the collection, passing keyword arguments along as parameters to
        the underlying service operation, which are typically used to filter the
        results.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/multipartupload/parts.html#filter)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#multipartuploadparts)
        """

    def limit(self, count: int) -> MultipartUploadPartsCollection:
        """
        Return at most this many MultipartUploadParts.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/multipartupload/parts.html#limit)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#multipartuploadparts)
        """

    def page_size(self, count: int) -> MultipartUploadPartsCollection:
        """
        Fetch at most this many MultipartUploadParts per service request.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/multipartupload/parts.html#page_size)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#multipartuploadparts)
        """

    def pages(  # type: ignore[override]
        self,
    ) -> AsyncIterator[list[MultipartUploadPart]]:
        """
        A generator which yields pages of MultipartUploadParts.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/multipartupload/parts.html#pages)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#multipartuploadparts)
        """

    def __iter__(self) -> NoReturn:
        """
        A generator which yields MultipartUploadParts.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/multipartupload/parts.html#__iter__)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#multipartuploadparts)
        """

    def __aiter__(self) -> AsyncIterator[MultipartUploadPart]:
        """
        A generator which yields MultipartUploadParts.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/multipartupload/parts.html#__iter__)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#multipartuploadparts)
        """


class Bucket(AIOBoto3ServiceResource):
    """
    [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/index.html#S3.Bucket)
    [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucket)
    """

    name: str
    multipart_uploads: BucketMultipartUploadsCollection
    object_versions: BucketObjectVersionsCollection
    objects: BucketObjectsCollection
    creation_date: Awaitable[datetime]
    bucket_region: Awaitable[str]
    meta: S3ResourceMeta  # type: ignore[override]

    async def get_available_subresources(self) -> Sequence[str]:
        """
        Returns a list of all the available sub-resources for this Bucket.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/get_available_subresources.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketget_available_subresources-method)
        """

    async def create(
        self, **kwargs: Unpack[CreateBucketRequestBucketCreateTypeDef]
    ) -> CreateBucketOutputTypeDef:
        """
        This action creates an Amazon S3 bucket.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/create.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketcreate-method)
        """

    async def delete(self, **kwargs: Unpack[DeleteBucketRequestBucketDeleteTypeDef]) -> None:
        """
        Deletes the S3 bucket.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/delete.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketdelete-method)
        """

    async def delete_objects(
        self, **kwargs: Unpack[DeleteObjectsRequestBucketDeleteObjectsTypeDef]
    ) -> DeleteObjectsOutputTypeDef:
        """
        This operation enables you to delete multiple objects from a bucket using a
        single HTTP request.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/delete_objects.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketdelete_objects-method)
        """

    async def put_object(self, **kwargs: Unpack[PutObjectRequestBucketPutObjectTypeDef]) -> _Object:
        """
        Adds an object to a bucket.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/put_object.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketput_object-method)
        """

    async def wait_until_exists(self) -> None:
        """
        Waits until Bucket is exists.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/wait_until_exists.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketwait_until_exists-method)
        """

    async def wait_until_not_exists(self) -> None:
        """
        Waits until Bucket is not_exists.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/wait_until_not_exists.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketwait_until_not_exists-method)
        """

    async def Acl(self) -> _BucketAcl:
        """
        Creates a BucketAcl resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/Acl.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketacl-method)
        """

    async def Cors(self) -> _BucketCors:
        """
        Creates a BucketCors resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/Cors.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketcors-method)
        """

    async def Lifecycle(self) -> _BucketLifecycle:
        """
        Creates a BucketLifecycle resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/Lifecycle.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketlifecycle-method)
        """

    async def LifecycleConfiguration(self) -> _BucketLifecycleConfiguration:
        """
        Creates a BucketLifecycleConfiguration resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/LifecycleConfiguration.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketlifecycleconfiguration-method)
        """

    async def Logging(self) -> _BucketLogging:
        """
        Creates a BucketLogging resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/Logging.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketlogging-method)
        """

    async def Notification(self) -> _BucketNotification:
        """
        Creates a BucketNotification resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/Notification.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketnotification-method)
        """

    async def Object(self, key: str) -> _Object:
        """
        Creates a Object resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/Object.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketobject-method)
        """

    async def Policy(self) -> _BucketPolicy:
        """
        Creates a BucketPolicy resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/Policy.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketpolicy-method)
        """

    async def RequestPayment(self) -> _BucketRequestPayment:
        """
        Creates a BucketRequestPayment resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/RequestPayment.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketrequestpayment-method)
        """

    async def Tagging(self) -> _BucketTagging:
        """
        Creates a BucketTagging resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/Tagging.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#buckettagging-method)
        """

    async def Versioning(self) -> _BucketVersioning:
        """
        Creates a BucketVersioning resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/Versioning.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketversioning-method)
        """

    async def Website(self) -> _BucketWebsite:
        """
        Creates a BucketWebsite resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/Website.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketwebsite-method)
        """

    async def load(self) -> None:
        """
        Calls s3.Client.list_buckets() to update the attributes of the Bucket resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/load.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketload-method)
        """

    async def copy(
        self,
        CopySource: CopySourceTypeDef,
        Key: str,
        ExtraArgs: dict[str, Any] | None = ...,
        Callback: Callable[..., Any] | None = ...,
        SourceClient: AioBaseClient | None = ...,
        Config: TransferConfig | None = ...,
    ) -> None:
        """
        Copy an object from one S3 location to another.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/copy.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketcopy-method)
        """

    async def download_file(
        self,
        Key: str,
        Filename: str,
        ExtraArgs: dict[str, Any] | None = ...,
        Callback: Callable[..., Any] | None = ...,
        Config: TransferConfig | None = ...,
    ) -> None:
        """
        Download an object from S3 to a file.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/download_file.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketdownload_file-method)
        """

    async def download_fileobj(
        self,
        Key: str,
        Fileobj: FileobjTypeDef,
        ExtraArgs: dict[str, Any] | None = ...,
        Callback: Callable[..., Any] | None = ...,
        Config: TransferConfig | None = ...,
    ) -> None:
        """
        Download an object from S3 to a file-like object.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/download_fileobj.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketdownload_fileobj-method)
        """

    async def upload_file(
        self,
        Filename: str,
        Key: str,
        ExtraArgs: dict[str, Any] | None = ...,
        Callback: Callable[..., Any] | None = ...,
        Config: TransferConfig | None = ...,
    ) -> None:
        """
        Upload a file to S3.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/upload_file.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketupload_file-method)
        """

    async def upload_fileobj(
        self,
        Fileobj: FileobjTypeDef,
        Key: str,
        ExtraArgs: dict[str, Any] | None = ...,
        Callback: Callable[..., Any] | None = ...,
        Config: TransferConfig | None = ...,
    ) -> None:
        """
        Upload a file-like object to S3.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucket/upload_fileobj.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketupload_fileobj-method)
        """


_Bucket = Bucket


class BucketAcl(AIOBoto3ServiceResource):
    """
    [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketacl/index.html#S3.BucketAcl)
    [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketacl)
    """

    bucket_name: str
    owner: Awaitable[OwnerTypeDef]
    grants: Awaitable[list[GrantTypeDef]]
    meta: S3ResourceMeta  # type: ignore[override]

    async def get_available_subresources(self) -> Sequence[str]:
        """
        Returns a list of all the available sub-resources for this BucketAcl.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketacl/get_available_subresources.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketaclget_available_subresources-method)
        """

    async def put(self, **kwargs: Unpack[PutBucketAclRequestBucketAclPutTypeDef]) -> None:
        """
        This operation is not supported for directory buckets.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketacl/put.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketaclput-method)
        """

    async def Bucket(self) -> _Bucket:
        """
        Creates a Bucket resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketacl/Bucket.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketaclbucket-method)
        """

    async def load(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketacl/load.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketaclload-method)
        """

    async def reload(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketacl/reload.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketaclreload-method)
        """


_BucketAcl = BucketAcl


class BucketCors(AIOBoto3ServiceResource):
    """
    [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketcors/index.html#S3.BucketCors)
    [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketcors)
    """

    bucket_name: str
    cors_rules: Awaitable[list[CORSRuleOutputTypeDef]]
    meta: S3ResourceMeta  # type: ignore[override]

    async def get_available_subresources(self) -> Sequence[str]:
        """
        Returns a list of all the available sub-resources for this BucketCors.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketcors/get_available_subresources.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketcorsget_available_subresources-method)
        """

    async def delete(
        self, **kwargs: Unpack[DeleteBucketCorsRequestBucketCorsDeleteTypeDef]
    ) -> None:
        """
        This operation is not supported for directory buckets.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketcors/delete.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketcorsdelete-method)
        """

    async def put(self, **kwargs: Unpack[PutBucketCorsRequestBucketCorsPutTypeDef]) -> None:
        """
        This operation is not supported for directory buckets.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketcors/put.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketcorsput-method)
        """

    async def Bucket(self) -> _Bucket:
        """
        Creates a Bucket resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketcors/Bucket.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketcorsbucket-method)
        """

    async def load(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketcors/load.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketcorsload-method)
        """

    async def reload(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketcors/reload.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketcorsreload-method)
        """


_BucketCors = BucketCors


class BucketLifecycle(AIOBoto3ServiceResource):
    """
    [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketlifecycle/index.html#S3.BucketLifecycle)
    [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketlifecycle)
    """

    bucket_name: str
    rules: Awaitable[list[RuleOutputTypeDef]]
    meta: S3ResourceMeta  # type: ignore[override]

    async def get_available_subresources(self) -> Sequence[str]:
        """
        Returns a list of all the available sub-resources for this BucketLifecycle.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketlifecycle/get_available_subresources.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketlifecycleget_available_subresources-method)
        """

    async def delete(
        self, **kwargs: Unpack[DeleteBucketLifecycleRequestBucketLifecycleDeleteTypeDef]
    ) -> None:
        """
        Deletes the lifecycle configuration from the specified bucket.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketlifecycle/delete.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketlifecycledelete-method)
        """

    async def put(
        self, **kwargs: Unpack[PutBucketLifecycleRequestBucketLifecyclePutTypeDef]
    ) -> None:
        """
        This operation is not supported for directory buckets.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketlifecycle/put.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketlifecycleput-method)
        """

    async def Bucket(self) -> _Bucket:
        """
        Creates a Bucket resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketlifecycle/Bucket.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketlifecyclebucket-method)
        """

    async def load(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketlifecycle/load.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketlifecycleload-method)
        """

    async def reload(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketlifecycle/reload.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketlifecyclereload-method)
        """


_BucketLifecycle = BucketLifecycle


class BucketLifecycleConfiguration(AIOBoto3ServiceResource):
    """
    [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketlifecycleconfiguration/index.html#S3.BucketLifecycleConfiguration)
    [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketlifecycleconfiguration)
    """

    bucket_name: str
    rules: Awaitable[list[LifecycleRuleOutputTypeDef]]
    transition_default_minimum_object_size: Awaitable[TransitionDefaultMinimumObjectSizeType]
    meta: S3ResourceMeta  # type: ignore[override]

    async def get_available_subresources(self) -> Sequence[str]:
        """
        Returns a list of all the available sub-resources for this
        BucketLifecycleConfiguration.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketlifecycleconfiguration/get_available_subresources.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketlifecycleconfigurationget_available_subresources-method)
        """

    async def delete(
        self,
        **kwargs: Unpack[DeleteBucketLifecycleRequestBucketLifecycleConfigurationDeleteTypeDef],
    ) -> None:
        """
        Deletes the lifecycle configuration from the specified bucket.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketlifecycleconfiguration/delete.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketlifecycleconfigurationdelete-method)
        """

    async def put(
        self,
        **kwargs: Unpack[
            PutBucketLifecycleConfigurationRequestBucketLifecycleConfigurationPutTypeDef
        ],
    ) -> PutBucketLifecycleConfigurationOutputTypeDef:
        """
        Creates a new lifecycle configuration for the bucket or replaces an existing
        lifecycle configuration.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketlifecycleconfiguration/put.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketlifecycleconfigurationput-method)
        """

    async def Bucket(self) -> _Bucket:
        """
        Creates a Bucket resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketlifecycleconfiguration/Bucket.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketlifecycleconfigurationbucket-method)
        """

    async def load(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketlifecycleconfiguration/load.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketlifecycleconfigurationload-method)
        """

    async def reload(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketlifecycleconfiguration/reload.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketlifecycleconfigurationreload-method)
        """


_BucketLifecycleConfiguration = BucketLifecycleConfiguration


class BucketLogging(AIOBoto3ServiceResource):
    """
    [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketlogging/index.html#S3.BucketLogging)
    [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketlogging)
    """

    bucket_name: str
    logging_enabled: Awaitable[LoggingEnabledOutputTypeDef]
    meta: S3ResourceMeta  # type: ignore[override]

    async def get_available_subresources(self) -> Sequence[str]:
        """
        Returns a list of all the available sub-resources for this BucketLogging.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketlogging/get_available_subresources.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketloggingget_available_subresources-method)
        """

    async def put(self, **kwargs: Unpack[PutBucketLoggingRequestBucketLoggingPutTypeDef]) -> None:
        """
        This operation is not supported for directory buckets.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketlogging/put.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketloggingput-method)
        """

    async def Bucket(self) -> _Bucket:
        """
        Creates a Bucket resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketlogging/Bucket.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketloggingbucket-method)
        """

    async def load(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketlogging/load.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketloggingload-method)
        """

    async def reload(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketlogging/reload.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketloggingreload-method)
        """


_BucketLogging = BucketLogging


class BucketNotification(AIOBoto3ServiceResource):
    """
    [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketnotification/index.html#S3.BucketNotification)
    [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketnotification)
    """

    bucket_name: str
    topic_configurations: Awaitable[list[TopicConfigurationOutputTypeDef]]
    queue_configurations: Awaitable[list[QueueConfigurationOutputTypeDef]]
    lambda_function_configurations: Awaitable[list[LambdaFunctionConfigurationOutputTypeDef]]
    event_bridge_configuration: Awaitable[dict[str, Any]]
    meta: S3ResourceMeta  # type: ignore[override]

    async def get_available_subresources(self) -> Sequence[str]:
        """
        Returns a list of all the available sub-resources for this BucketNotification.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketnotification/get_available_subresources.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketnotificationget_available_subresources-method)
        """

    async def put(
        self,
        **kwargs: Unpack[PutBucketNotificationConfigurationRequestBucketNotificationPutTypeDef],
    ) -> None:
        """
        This operation is not supported for directory buckets.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketnotification/put.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketnotificationput-method)
        """

    async def Bucket(self) -> _Bucket:
        """
        Creates a Bucket resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketnotification/Bucket.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketnotificationbucket-method)
        """

    async def load(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketnotification/load.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketnotificationload-method)
        """

    async def reload(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketnotification/reload.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketnotificationreload-method)
        """


_BucketNotification = BucketNotification


class BucketPolicy(AIOBoto3ServiceResource):
    """
    [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketpolicy/index.html#S3.BucketPolicy)
    [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketpolicy)
    """

    bucket_name: str
    policy: Awaitable[str]
    meta: S3ResourceMeta  # type: ignore[override]

    async def get_available_subresources(self) -> Sequence[str]:
        """
        Returns a list of all the available sub-resources for this BucketPolicy.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketpolicy/get_available_subresources.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketpolicyget_available_subresources-method)
        """

    async def delete(
        self, **kwargs: Unpack[DeleteBucketPolicyRequestBucketPolicyDeleteTypeDef]
    ) -> None:
        """
        Deletes the policy of a specified bucket.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketpolicy/delete.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketpolicydelete-method)
        """

    async def put(self, **kwargs: Unpack[PutBucketPolicyRequestBucketPolicyPutTypeDef]) -> None:
        """
        Applies an Amazon S3 bucket policy to an Amazon S3 bucket.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketpolicy/put.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketpolicyput-method)
        """

    async def Bucket(self) -> _Bucket:
        """
        Creates a Bucket resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketpolicy/Bucket.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketpolicybucket-method)
        """

    async def load(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketpolicy/load.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketpolicyload-method)
        """

    async def reload(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketpolicy/reload.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketpolicyreload-method)
        """


_BucketPolicy = BucketPolicy


class BucketRequestPayment(AIOBoto3ServiceResource):
    """
    [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketrequestpayment/index.html#S3.BucketRequestPayment)
    [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketrequestpayment)
    """

    bucket_name: str
    payer: Awaitable[PayerType]
    meta: S3ResourceMeta  # type: ignore[override]

    async def get_available_subresources(self) -> Sequence[str]:
        """
        Returns a list of all the available sub-resources for this BucketRequestPayment.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketrequestpayment/get_available_subresources.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketrequestpaymentget_available_subresources-method)
        """

    async def put(
        self, **kwargs: Unpack[PutBucketRequestPaymentRequestBucketRequestPaymentPutTypeDef]
    ) -> None:
        """
        This operation is not supported for directory buckets.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketrequestpayment/put.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketrequestpaymentput-method)
        """

    async def Bucket(self) -> _Bucket:
        """
        Creates a Bucket resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketrequestpayment/Bucket.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketrequestpaymentbucket-method)
        """

    async def load(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketrequestpayment/load.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketrequestpaymentload-method)
        """

    async def reload(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketrequestpayment/reload.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketrequestpaymentreload-method)
        """


_BucketRequestPayment = BucketRequestPayment


class BucketTagging(AIOBoto3ServiceResource):
    """
    [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/buckettagging/index.html#S3.BucketTagging)
    [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#buckettagging)
    """

    bucket_name: str
    tag_set: Awaitable[list[TagTypeDef]]
    meta: S3ResourceMeta  # type: ignore[override]

    async def get_available_subresources(self) -> Sequence[str]:
        """
        Returns a list of all the available sub-resources for this BucketTagging.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/buckettagging/get_available_subresources.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#buckettaggingget_available_subresources-method)
        """

    async def delete(
        self, **kwargs: Unpack[DeleteBucketTaggingRequestBucketTaggingDeleteTypeDef]
    ) -> None:
        """
        This operation is not supported for directory buckets.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/buckettagging/delete.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#buckettaggingdelete-method)
        """

    async def put(self, **kwargs: Unpack[PutBucketTaggingRequestBucketTaggingPutTypeDef]) -> None:
        """
        This operation is not supported for directory buckets.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/buckettagging/put.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#buckettaggingput-method)
        """

    async def Bucket(self) -> _Bucket:
        """
        Creates a Bucket resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/buckettagging/Bucket.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#buckettaggingbucket-method)
        """

    async def load(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/buckettagging/load.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#buckettaggingload-method)
        """

    async def reload(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/buckettagging/reload.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#buckettaggingreload-method)
        """


_BucketTagging = BucketTagging


class BucketVersioning(AIOBoto3ServiceResource):
    """
    [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketversioning/index.html#S3.BucketVersioning)
    [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketversioning)
    """

    bucket_name: str
    status: Awaitable[BucketVersioningStatusType]
    mfa_delete: Awaitable[MFADeleteStatusType]
    meta: S3ResourceMeta  # type: ignore[override]

    async def get_available_subresources(self) -> Sequence[str]:
        """
        Returns a list of all the available sub-resources for this BucketVersioning.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketversioning/get_available_subresources.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketversioningget_available_subresources-method)
        """

    async def enable(
        self, **kwargs: Unpack[PutBucketVersioningRequestBucketVersioningEnableTypeDef]
    ) -> None:
        """
        This operation is not supported for directory buckets.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketversioning/enable.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketversioningenable-method)
        """

    async def put(
        self, **kwargs: Unpack[PutBucketVersioningRequestBucketVersioningPutTypeDef]
    ) -> None:
        """
        This operation is not supported for directory buckets.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketversioning/put.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketversioningput-method)
        """

    async def suspend(
        self, **kwargs: Unpack[PutBucketVersioningRequestBucketVersioningSuspendTypeDef]
    ) -> None:
        """
        This operation is not supported for directory buckets.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketversioning/suspend.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketversioningsuspend-method)
        """

    async def Bucket(self) -> _Bucket:
        """
        Creates a Bucket resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketversioning/Bucket.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketversioningbucket-method)
        """

    async def load(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketversioning/load.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketversioningload-method)
        """

    async def reload(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketversioning/reload.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketversioningreload-method)
        """


_BucketVersioning = BucketVersioning


class BucketWebsite(AIOBoto3ServiceResource):
    """
    [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketwebsite/index.html#S3.BucketWebsite)
    [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketwebsite)
    """

    bucket_name: str
    redirect_all_requests_to: Awaitable[RedirectAllRequestsToTypeDef]
    index_document: Awaitable[IndexDocumentTypeDef]
    error_document: Awaitable[ErrorDocumentTypeDef]
    routing_rules: Awaitable[list[RoutingRuleTypeDef]]
    meta: S3ResourceMeta  # type: ignore[override]

    async def get_available_subresources(self) -> Sequence[str]:
        """
        Returns a list of all the available sub-resources for this BucketWebsite.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketwebsite/get_available_subresources.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketwebsiteget_available_subresources-method)
        """

    async def delete(
        self, **kwargs: Unpack[DeleteBucketWebsiteRequestBucketWebsiteDeleteTypeDef]
    ) -> None:
        """
        This operation is not supported for directory buckets.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketwebsite/delete.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketwebsitedelete-method)
        """

    async def put(self, **kwargs: Unpack[PutBucketWebsiteRequestBucketWebsitePutTypeDef]) -> None:
        """
        This operation is not supported for directory buckets.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketwebsite/put.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketwebsiteput-method)
        """

    async def Bucket(self) -> _Bucket:
        """
        Creates a Bucket resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketwebsite/Bucket.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketwebsitebucket-method)
        """

    async def load(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketwebsite/load.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketwebsiteload-method)
        """

    async def reload(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/bucketwebsite/reload.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#bucketwebsitereload-method)
        """


_BucketWebsite = BucketWebsite


class MultipartUpload(AIOBoto3ServiceResource):
    """
    [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/multipartupload/index.html#S3.MultipartUpload)
    [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#multipartupload)
    """

    bucket_name: str
    object_key: str
    id: str
    parts: MultipartUploadPartsCollection
    upload_id: Awaitable[str]
    key: Awaitable[str]
    initiated: Awaitable[datetime]
    storage_class: Awaitable[StorageClassType]
    owner: Awaitable[OwnerTypeDef]
    initiator: Awaitable[InitiatorTypeDef]
    checksum_algorithm: Awaitable[ChecksumAlgorithmType]
    checksum_type: Awaitable[ChecksumTypeType]
    meta: S3ResourceMeta  # type: ignore[override]

    async def get_available_subresources(self) -> Sequence[str]:
        """
        Returns a list of all the available sub-resources for this MultipartUpload.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/multipartupload/get_available_subresources.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#multipartuploadget_available_subresources-method)
        """

    async def abort(
        self, **kwargs: Unpack[AbortMultipartUploadRequestMultipartUploadAbortTypeDef]
    ) -> AbortMultipartUploadOutputTypeDef:
        """
        This operation aborts a multipart upload.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/multipartupload/abort.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#multipartuploadabort-method)
        """

    async def complete(
        self, **kwargs: Unpack[CompleteMultipartUploadRequestMultipartUploadCompleteTypeDef]
    ) -> _Object:
        """
        Completes a multipart upload by assembling previously uploaded parts.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/multipartupload/complete.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#multipartuploadcomplete-method)
        """

    async def Object(self) -> _Object:
        """
        Creates a Object resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/multipartupload/Object.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#multipartuploadobject-method)
        """

    async def Part(self, part_number: int) -> _MultipartUploadPart:
        """
        Creates a MultipartUploadPart resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/multipartupload/Part.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#multipartuploadpart-method)
        """


_MultipartUpload = MultipartUpload


class MultipartUploadPart(AIOBoto3ServiceResource):
    """
    [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/multipartuploadpart/index.html#S3.MultipartUploadPart)
    [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#multipartuploadpart)
    """

    bucket_name: str
    object_key: str
    multipart_upload_id: str
    part_number: int
    last_modified: Awaitable[datetime]
    e_tag: Awaitable[str]
    size: Awaitable[int]
    checksum_crc32: Awaitable[str]
    checksum_crc32_c: Awaitable[str]
    checksum_crc64_nvme: Awaitable[str]
    checksum_sha1: Awaitable[str]
    checksum_sha256: Awaitable[str]
    meta: S3ResourceMeta  # type: ignore[override]

    async def get_available_subresources(self) -> Sequence[str]:
        """
        Returns a list of all the available sub-resources for this MultipartUploadPart.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/multipartuploadpart/get_available_subresources.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#multipartuploadpartget_available_subresources-method)
        """

    async def copy_from(
        self, **kwargs: Unpack[UploadPartCopyRequestMultipartUploadPartCopyFromTypeDef]
    ) -> UploadPartCopyOutputTypeDef:
        """
        Uploads a part by copying data from an existing object as data source.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/multipartuploadpart/copy_from.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#multipartuploadpartcopy_from-method)
        """

    async def upload(
        self, **kwargs: Unpack[UploadPartRequestMultipartUploadPartUploadTypeDef]
    ) -> UploadPartOutputTypeDef:
        """
        Uploads a part in a multipart upload.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/multipartuploadpart/upload.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#multipartuploadpartupload-method)
        """

    async def MultipartUpload(self) -> _MultipartUpload:
        """
        Creates a MultipartUpload resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/multipartuploadpart/MultipartUpload.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#multipartuploadpartmultipartupload-method)
        """


_MultipartUploadPart = MultipartUploadPart


class Object(AIOBoto3ServiceResource):
    """
    [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/object/index.html#S3.Object)
    [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#object)
    """

    bucket_name: str
    key: str
    delete_marker: Awaitable[bool]
    accept_ranges: Awaitable[str]
    expiration: Awaitable[str]
    restore: Awaitable[str]
    archive_status: Awaitable[ArchiveStatusType]
    last_modified: Awaitable[datetime]
    content_length: Awaitable[int]
    checksum_crc32: Awaitable[str]
    checksum_crc32_c: Awaitable[str]
    checksum_crc64_nvme: Awaitable[str]
    checksum_sha1: Awaitable[str]
    checksum_sha256: Awaitable[str]
    checksum_type: Awaitable[ChecksumTypeType]
    e_tag: Awaitable[str]
    missing_meta: Awaitable[int]
    version_id: Awaitable[str]
    cache_control: Awaitable[str]
    content_disposition: Awaitable[str]
    content_encoding: Awaitable[str]
    content_language: Awaitable[str]
    content_type: Awaitable[str]
    content_range: Awaitable[str]
    expires: Awaitable[datetime]
    website_redirect_location: Awaitable[str]
    server_side_encryption: Awaitable[ServerSideEncryptionType]
    metadata: Awaitable[dict[str, str]]
    sse_customer_algorithm: Awaitable[str]
    sse_customer_key_md5: Awaitable[str]
    ssekms_key_id: Awaitable[str]
    bucket_key_enabled: Awaitable[bool]
    storage_class: Awaitable[StorageClassType]
    request_charged: Awaitable[Literal["requester"]]
    replication_status: Awaitable[ReplicationStatusType]
    parts_count: Awaitable[int]
    object_lock_mode: Awaitable[ObjectLockModeType]
    object_lock_retain_until_date: Awaitable[datetime]
    object_lock_legal_hold_status: Awaitable[ObjectLockLegalHoldStatusType]
    meta: S3ResourceMeta  # type: ignore[override]

    async def get_available_subresources(self) -> Sequence[str]:
        """
        Returns a list of all the available sub-resources for this Object.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/object/get_available_subresources.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectget_available_subresources-method)
        """

    async def copy_from(
        self, **kwargs: Unpack[CopyObjectRequestObjectCopyFromTypeDef]
    ) -> CopyObjectOutputTypeDef:
        """
        Creates a copy of an object that is already stored in Amazon S3.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/object/copy_from.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectcopy_from-method)
        """

    async def delete(
        self, **kwargs: Unpack[DeleteObjectRequestObjectDeleteTypeDef]
    ) -> DeleteObjectOutputTypeDef:
        """
        Removes an object from a bucket.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/object/delete.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectdelete-method)
        """

    async def get(
        self, **kwargs: Unpack[GetObjectRequestObjectGetTypeDef]
    ) -> GetObjectOutputTypeDef:
        """
        Retrieves an object from Amazon S3.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/object/get.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectget-method)
        """

    async def initiate_multipart_upload(
        self, **kwargs: Unpack[CreateMultipartUploadRequestObjectInitiateMultipartUploadTypeDef]
    ) -> _MultipartUpload:
        """
        This action initiates a multipart upload and returns an upload ID.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/object/initiate_multipart_upload.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectinitiate_multipart_upload-method)
        """

    async def put(
        self, **kwargs: Unpack[PutObjectRequestObjectPutTypeDef]
    ) -> PutObjectOutputTypeDef:
        """
        Adds an object to a bucket.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/object/put.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectput-method)
        """

    async def restore_object(
        self, **kwargs: Unpack[RestoreObjectRequestObjectRestoreObjectTypeDef]
    ) -> RestoreObjectOutputTypeDef:
        """
        This operation is not supported for directory buckets.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/object/restore_object.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectrestore_object-method)
        """

    async def wait_until_exists(self) -> None:
        """
        Waits until Object is exists.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/object/wait_until_exists.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectwait_until_exists-method)
        """

    async def wait_until_not_exists(self) -> None:
        """
        Waits until Object is not_exists.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/object/wait_until_not_exists.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectwait_until_not_exists-method)
        """

    async def Acl(self) -> _ObjectAcl:
        """
        Creates a ObjectAcl resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/object/Acl.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectacl-method)
        """

    async def Bucket(self) -> _Bucket:
        """
        Creates a Bucket resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/object/Bucket.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectbucket-method)
        """

    async def MultipartUpload(self, id: str) -> _MultipartUpload:
        """
        Creates a MultipartUpload resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/object/MultipartUpload.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectmultipartupload-method)
        """

    async def Version(self, id: str) -> _ObjectVersion:
        """
        Creates a ObjectVersion resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/object/Version.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectversion-method)
        """

    async def copy(
        self,
        CopySource: CopySourceTypeDef,
        ExtraArgs: dict[str, Any] | None = ...,
        Callback: Callable[..., Any] | None = ...,
        SourceClient: AioBaseClient | None = ...,
        Config: TransferConfig | None = ...,
    ) -> None:
        """
        Copy an object from one S3 location to another.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/object/copy.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectcopy-method)
        """

    async def download_file(
        self,
        Filename: str,
        ExtraArgs: dict[str, Any] | None = ...,
        Callback: Callable[..., Any] | None = ...,
        Config: TransferConfig | None = ...,
    ) -> None:
        """
        Download an object from S3 to a file.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/object/download_file.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectdownload_file-method)
        """

    async def download_fileobj(
        self,
        Fileobj: FileobjTypeDef,
        ExtraArgs: dict[str, Any] | None = ...,
        Callback: Callable[..., Any] | None = ...,
        Config: TransferConfig | None = ...,
    ) -> None:
        """
        Download an object from S3 to a file-like object.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/object/download_fileobj.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectdownload_fileobj-method)
        """

    async def upload_file(
        self,
        Filename: str,
        ExtraArgs: dict[str, Any] | None = ...,
        Callback: Callable[..., Any] | None = ...,
        Config: TransferConfig | None = ...,
    ) -> None:
        """
        Upload a file to S3.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/object/upload_file.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectupload_file-method)
        """

    async def upload_fileobj(
        self,
        Fileobj: FileobjTypeDef,
        ExtraArgs: dict[str, Any] | None = ...,
        Callback: Callable[..., Any] | None = ...,
        Config: TransferConfig | None = ...,
    ) -> None:
        """
        Upload a file-like object to S3.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/object/upload_fileobj.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectupload_fileobj-method)
        """

    async def load(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/object/load.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectload-method)
        """

    async def reload(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/object/reload.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectreload-method)
        """


_Object = Object


class ObjectAcl(AIOBoto3ServiceResource):
    """
    [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectacl/index.html#S3.ObjectAcl)
    [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectacl)
    """

    bucket_name: str
    object_key: str
    owner: Awaitable[OwnerTypeDef]
    grants: Awaitable[list[GrantTypeDef]]
    request_charged: Awaitable[Literal["requester"]]
    meta: S3ResourceMeta  # type: ignore[override]

    async def get_available_subresources(self) -> Sequence[str]:
        """
        Returns a list of all the available sub-resources for this ObjectAcl.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectacl/get_available_subresources.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectaclget_available_subresources-method)
        """

    async def put(
        self, **kwargs: Unpack[PutObjectAclRequestObjectAclPutTypeDef]
    ) -> PutObjectAclOutputTypeDef:
        """
        This operation is not supported for directory buckets.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectacl/put.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectaclput-method)
        """

    async def Object(self) -> _Object:
        """
        Creates a Object resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectacl/Object.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectaclobject-method)
        """

    async def load(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectacl/load.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectaclload-method)
        """

    async def reload(self) -> None:
        """
        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectacl/reload.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectaclreload-method)
        """


_ObjectAcl = ObjectAcl


class ObjectSummary(AIOBoto3ServiceResource):
    """
    [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectsummary/index.html#S3.ObjectSummary)
    [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectsummary)
    """

    bucket_name: str
    key: str
    last_modified: Awaitable[datetime]
    e_tag: Awaitable[str]
    checksum_algorithm: Awaitable[list[ChecksumAlgorithmType]]
    checksum_type: Awaitable[ChecksumTypeType]
    size: Awaitable[int]
    storage_class: Awaitable[ObjectStorageClassType]
    owner: Awaitable[OwnerTypeDef]
    restore_status: Awaitable[RestoreStatusTypeDef]
    meta: S3ResourceMeta  # type: ignore[override]

    async def get_available_subresources(self) -> Sequence[str]:
        """
        Returns a list of all the available sub-resources for this ObjectSummary.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectsummary/get_available_subresources.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectsummaryget_available_subresources-method)
        """

    async def copy_from(
        self, **kwargs: Unpack[CopyObjectRequestObjectSummaryCopyFromTypeDef]
    ) -> CopyObjectOutputTypeDef:
        """
        Creates a copy of an object that is already stored in Amazon S3.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectsummary/copy_from.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectsummarycopy_from-method)
        """

    async def delete(
        self, **kwargs: Unpack[DeleteObjectRequestObjectSummaryDeleteTypeDef]
    ) -> DeleteObjectOutputTypeDef:
        """
        Removes an object from a bucket.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectsummary/delete.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectsummarydelete-method)
        """

    async def get(
        self, **kwargs: Unpack[GetObjectRequestObjectSummaryGetTypeDef]
    ) -> GetObjectOutputTypeDef:
        """
        Retrieves an object from Amazon S3.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectsummary/get.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectsummaryget-method)
        """

    async def initiate_multipart_upload(
        self,
        **kwargs: Unpack[CreateMultipartUploadRequestObjectSummaryInitiateMultipartUploadTypeDef],
    ) -> _MultipartUpload:
        """
        This action initiates a multipart upload and returns an upload ID.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectsummary/initiate_multipart_upload.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectsummaryinitiate_multipart_upload-method)
        """

    async def put(
        self, **kwargs: Unpack[PutObjectRequestObjectSummaryPutTypeDef]
    ) -> PutObjectOutputTypeDef:
        """
        Adds an object to a bucket.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectsummary/put.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectsummaryput-method)
        """

    async def restore_object(
        self, **kwargs: Unpack[RestoreObjectRequestObjectSummaryRestoreObjectTypeDef]
    ) -> RestoreObjectOutputTypeDef:
        """
        This operation is not supported for directory buckets.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectsummary/restore_object.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectsummaryrestore_object-method)
        """

    async def wait_until_exists(self) -> None:
        """
        Waits until ObjectSummary is exists.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectsummary/wait_until_exists.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectsummarywait_until_exists-method)
        """

    async def wait_until_not_exists(self) -> None:
        """
        Waits until ObjectSummary is not_exists.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectsummary/wait_until_not_exists.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectsummarywait_until_not_exists-method)
        """

    async def Acl(self) -> _ObjectAcl:
        """
        Creates a ObjectAcl resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectsummary/Acl.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectsummaryacl-method)
        """

    async def Bucket(self) -> _Bucket:
        """
        Creates a Bucket resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectsummary/Bucket.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectsummarybucket-method)
        """

    async def MultipartUpload(self, id: str) -> _MultipartUpload:
        """
        Creates a MultipartUpload resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectsummary/MultipartUpload.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectsummarymultipartupload-method)
        """

    async def Object(self) -> _Object:
        """
        Creates a Object resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectsummary/Object.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectsummaryobject-method)
        """

    async def Version(self, id: str) -> _ObjectVersion:
        """
        Creates a ObjectVersion resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectsummary/Version.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectsummaryversion-method)
        """

    async def load(self) -> None:
        """
        Calls s3.Client.head_object to update the attributes of the ObjectSummary
        resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectsummary/load.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectsummaryload-method)
        """


_ObjectSummary = ObjectSummary


class ObjectVersion(AIOBoto3ServiceResource):
    """
    [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectversion/index.html#S3.ObjectVersion)
    [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectversion)
    """

    bucket_name: str
    object_key: str
    id: str
    e_tag: Awaitable[str]
    checksum_algorithm: Awaitable[list[ChecksumAlgorithmType]]
    checksum_type: Awaitable[ChecksumTypeType]
    size: Awaitable[int]
    storage_class: Awaitable[Literal["STANDARD"]]
    key: Awaitable[str]
    version_id: Awaitable[str]
    is_latest: Awaitable[bool]
    last_modified: Awaitable[datetime]
    owner: Awaitable[OwnerTypeDef]
    restore_status: Awaitable[RestoreStatusTypeDef]
    meta: S3ResourceMeta  # type: ignore[override]

    async def get_available_subresources(self) -> Sequence[str]:
        """
        Returns a list of all the available sub-resources for this ObjectVersion.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectversion/get_available_subresources.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectversionget_available_subresources-method)
        """

    async def delete(
        self, **kwargs: Unpack[DeleteObjectRequestObjectVersionDeleteTypeDef]
    ) -> DeleteObjectOutputTypeDef:
        """
        Removes an object from a bucket.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectversion/delete.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectversiondelete-method)
        """

    async def get(
        self, **kwargs: Unpack[GetObjectRequestObjectVersionGetTypeDef]
    ) -> GetObjectOutputTypeDef:
        """
        Retrieves an object from Amazon S3.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectversion/get.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectversionget-method)
        """

    async def head(
        self, **kwargs: Unpack[HeadObjectRequestObjectVersionHeadTypeDef]
    ) -> HeadObjectOutputTypeDef:
        """
        The <code>HEAD</code> operation retrieves metadata from an object without
        returning the object itself.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectversion/head.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectversionhead-method)
        """

    async def Object(self) -> _Object:
        """
        Creates a Object resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/objectversion/Object.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#objectversionobject-method)
        """


_ObjectVersion = ObjectVersion


class S3ResourceMeta:
    client: S3Client  # type: ignore[override]


class S3ServiceResource(AIOBoto3ServiceResource):
    """
    [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/index.html)
    [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/)
    """

    meta: S3ResourceMeta  # type: ignore[override]
    buckets: ServiceResourceBucketsCollection

    async def get_available_subresources(self) -> Sequence[str]:
        """
        Returns a list of all the available sub-resources for this resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/get_available_subresources.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#s3serviceresourceget_available_subresources-method)
        """

    async def create_bucket(
        self, **kwargs: Unpack[CreateBucketRequestServiceResourceCreateBucketTypeDef]
    ) -> _Bucket:
        """
        This action creates an Amazon S3 bucket.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/create_bucket.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#s3serviceresourcecreate_bucket-method)
        """

    async def Bucket(self, name: str) -> _Bucket:
        """
        Creates a Bucket resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/Bucket.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#s3serviceresourcebucket-method)
        """

    async def BucketAcl(self, bucket_name: str) -> _BucketAcl:
        """
        Creates a BucketAcl resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/BucketAcl.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#s3serviceresourcebucketacl-method)
        """

    async def BucketCors(self, bucket_name: str) -> _BucketCors:
        """
        Creates a BucketCors resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/BucketCors.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#s3serviceresourcebucketcors-method)
        """

    async def BucketLifecycle(self, bucket_name: str) -> _BucketLifecycle:
        """
        Creates a BucketLifecycle resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/BucketLifecycle.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#s3serviceresourcebucketlifecycle-method)
        """

    async def BucketLifecycleConfiguration(self, bucket_name: str) -> _BucketLifecycleConfiguration:
        """
        Creates a BucketLifecycleConfiguration resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/BucketLifecycleConfiguration.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#s3serviceresourcebucketlifecycleconfiguration-method)
        """

    async def BucketLogging(self, bucket_name: str) -> _BucketLogging:
        """
        Creates a BucketLogging resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/BucketLogging.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#s3serviceresourcebucketlogging-method)
        """

    async def BucketNotification(self, bucket_name: str) -> _BucketNotification:
        """
        Creates a BucketNotification resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/BucketNotification.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#s3serviceresourcebucketnotification-method)
        """

    async def BucketPolicy(self, bucket_name: str) -> _BucketPolicy:
        """
        Creates a BucketPolicy resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/BucketPolicy.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#s3serviceresourcebucketpolicy-method)
        """

    async def BucketRequestPayment(self, bucket_name: str) -> _BucketRequestPayment:
        """
        Creates a BucketRequestPayment resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/BucketRequestPayment.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#s3serviceresourcebucketrequestpayment-method)
        """

    async def BucketTagging(self, bucket_name: str) -> _BucketTagging:
        """
        Creates a BucketTagging resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/BucketTagging.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#s3serviceresourcebuckettagging-method)
        """

    async def BucketVersioning(self, bucket_name: str) -> _BucketVersioning:
        """
        Creates a BucketVersioning resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/BucketVersioning.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#s3serviceresourcebucketversioning-method)
        """

    async def BucketWebsite(self, bucket_name: str) -> _BucketWebsite:
        """
        Creates a BucketWebsite resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/BucketWebsite.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#s3serviceresourcebucketwebsite-method)
        """

    async def MultipartUpload(self, bucket_name: str, object_key: str, id: str) -> _MultipartUpload:
        """
        Creates a MultipartUpload resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/MultipartUpload.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#s3serviceresourcemultipartupload-method)
        """

    async def MultipartUploadPart(
        self, bucket_name: str, object_key: str, multipart_upload_id: str, part_number: int
    ) -> _MultipartUploadPart:
        """
        Creates a MultipartUploadPart resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/MultipartUploadPart.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#s3serviceresourcemultipartuploadpart-method)
        """

    async def Object(self, bucket_name: str, key: str) -> _Object:
        """
        Creates a Object resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/Object.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#s3serviceresourceobject-method)
        """

    async def ObjectAcl(self, bucket_name: str, object_key: str) -> _ObjectAcl:
        """
        Creates a ObjectAcl resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/ObjectAcl.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#s3serviceresourceobjectacl-method)
        """

    async def ObjectSummary(self, bucket_name: str, key: str) -> _ObjectSummary:
        """
        Creates a ObjectSummary resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/ObjectSummary.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#s3serviceresourceobjectsummary-method)
        """

    async def ObjectVersion(self, bucket_name: str, object_key: str, id: str) -> _ObjectVersion:
        """
        Creates a ObjectVersion resource.

        [Show boto3 documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3/service-resource/ObjectVersion.html)
        [Show types-aiobotocore documentation](https://youtype.github.io/types_aiobotocore_docs/types_aiobotocore_s3/service_resource/#s3serviceresourceobjectversion-method)
        """
