;; Cosmic Event NFT Contract

(define-non-fungible-token cosmic-event-nft uint)

(define-data-var event-id-nonce uint u0)

(define-map event-uris uint (string-utf8 256))
(define-map event-types uint (string-utf8 50))

(define-public (mint (recipient principal) (event-uri (string-utf8 256)) (event-type (string-utf8 50)))
  (let
    (
      (event-id (+ (var-get event-id-nonce) u1))
    )
    (try! (nft-mint? cosmic-event-nft event-id recipient))
    (map-set event-uris event-id event-uri)
    (map-set event-types event-id event-type)
    (var-set event-id-nonce event-id)
    (ok event-id)
  )
)

(define-public (transfer (event-id uint) (sender principal) (recipient principal))
  (nft-transfer? cosmic-event-nft event-id sender recipient)
)

(define-read-only (get-owner (event-id uint))
  (ok (nft-get-owner? cosmic-event-nft event-id))
)

(define-read-only (get-event-uri (event-id uint))
  (ok (map-get? event-uris event-id))
)

(define-read-only (get-event-type (event-id uint))
  (ok (map-get? event-types event-id))
)

(define-read-only (get-last-event-id)
  (ok (var-get event-id-nonce))
)

