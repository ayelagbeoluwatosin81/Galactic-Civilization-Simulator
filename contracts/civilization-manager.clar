;; Civilization Manager Contract

(define-data-var civilization-count uint u0)

(define-map civilizations uint
  {
    owner: principal,
    name: (string-utf8 100),
    technology-level: uint,
    population: uint,
    resources: uint,
    last-update: uint
  }
)

(define-public (create-civilization (name (string-utf8 100)))
  (let
    (
      (civilization-id (+ (var-get civilization-count) u1))
    )
    (map-set civilizations civilization-id
      {
        owner: tx-sender,
        name: name,
        technology-level: u1,
        population: u1000000,
        resources: u1000,
        last-update: block-height
      }
    )
    (var-set civilization-count civilization-id)
    (ok civilization-id)
  )
)

(define-public (update-civilization (civilization-id uint))
  (let
    (
      (civilization (unwrap! (map-get? civilizations civilization-id) (err u404)))
      (time-passed (- block-height (get last-update civilization)))
    )
    (asserts! (is-eq (get owner civilization) tx-sender) (err u403))
    (asserts! (> time-passed u0) (err u400))

    (let
      (
        (new-technology (+ (get technology-level civilization) (/ time-passed u100)))
        (new-population (+ (get population civilization) (* (get population civilization) (/ time-passed u1000))))
        (new-resources (+ (get resources civilization) (* (get technology-level civilization) (/ time-passed u10))))
      )
      (map-set civilizations civilization-id
        (merge civilization {
          technology-level: new-technology,
          population: new-population,
          resources: new-resources,
          last-update: block-height
        })
      )
      (ok true)
    )
  )
)

(define-read-only (get-civilization (civilization-id uint))
  (ok (unwrap! (map-get? civilizations civilization-id) (err u404)))
)

(define-read-only (get-civilization-count)
  (ok (var-get civilization-count))
)

