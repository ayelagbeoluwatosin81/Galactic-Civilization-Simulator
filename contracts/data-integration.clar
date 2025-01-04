;; Data Integration Contract

(define-constant CONTRACT-OWNER tx-sender)

(define-map astronomical-data uint
  {
    data-type: (string-utf8 50),
    value: uint,
    timestamp: uint
  }
)

(define-map physics-models uint
  {
    model-name: (string-utf8 100),
    parameters: (list 10 uint),
    timestamp: uint
  }
)

(define-data-var data-nonce uint u0)
(define-data-var model-nonce uint u0)

(define-public (add-astronomical-data (data-type (string-utf8 50)) (value uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err u403))
    (let
      (
        (data-id (+ (var-get data-nonce) u1))
      )
      (map-set astronomical-data data-id
        {
          data-type: data-type,
          value: value,
          timestamp: block-height
        }
      )
      (var-set data-nonce data-id)
      (ok data-id)
    )
  )
)

(define-public (add-physics-model (model-name (string-utf8 100)) (parameters (list 10 uint)))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err u403))
    (let
      (
        (model-id (+ (var-get model-nonce) u1))
      )
      (map-set physics-models model-id
        {
          model-name: model-name,
          parameters: parameters,
          timestamp: block-height
        }
      )
      (var-set model-nonce model-id)
      (ok model-id)
    )
  )
)

(define-read-only (get-astronomical-data (data-id uint))
  (ok (unwrap! (map-get? astronomical-data data-id) (err u404)))
)

(define-read-only (get-physics-model (model-id uint))
  (ok (unwrap! (map-get? physics-models model-id) (err u404)))
)

(define-read-only (get-data-count)
  (ok (var-get data-nonce))
)

(define-read-only (get-model-count)
  (ok (var-get model-nonce))
)

