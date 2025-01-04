;; Galactic Marketplace Contract

(define-constant LISTING-EXPIRATION u10000)

(define-map listings uint
  {
    seller: principal,
    item-type: (string-utf8 50),
    price: uint,
    expiration: uint
  }
)

(define-data-var listing-nonce uint u0)

(define-public (create-listing (item-type (string-utf8 50)) (price uint))
  (let
    (
      (listing-id (+ (var-get listing-nonce) u1))
    )
    (map-set listings listing-id
      {
        seller: tx-sender,
        item-type: item-type,
        price: price,
        expiration: (+ block-height LISTING-EXPIRATION)
      }
    )
    (var-set listing-nonce listing-id)
    (ok listing-id)
  )
)

(define-public (purchase-listing (listing-id uint))
  (let
    (
      (listing (unwrap! (map-get? listings listing-id) (err u404)))
    )
    (asserts! (< block-height (get expiration listing)) (err u400))
    (try! (stx-transfer? (get price listing) tx-sender (get seller listing)))
    (map-delete listings listing-id)
    (ok true)
  )
)

(define-public (cancel-listing (listing-id uint))
  (let
    (
      (listing (unwrap! (map-get? listings listing-id) (err u404)))
    )
    (asserts! (is-eq (get seller listing) tx-sender) (err u403))
    (map-delete listings listing-id)
    (ok true)
  )
)

(define-read-only (get-listing (listing-id uint))
  (ok (unwrap! (map-get? listings listing-id) (err u404)))
)

(define-read-only (get-listing-count)
  (ok (var-get listing-nonce))
)

