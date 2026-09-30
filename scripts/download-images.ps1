$baseUrl = "https://refugeemigrationlab.wordpress.com/wp-content/uploads/"
$imgBase = "F:\rml_project\public\images"

# Mapping: localPath → wpUploadPath (relative to wp-content/uploads/)
$downloads = [ordered]@{
  # ── Site images ──
  "site/rml-logo.png"                                  = "2025/04/cropped-screenshot-2025-04-26-at-12.22.46e280afam.png"
  "site/hero-rohingya-camps.jpg"                       = "2025/04/img_20210916_120351.jpg"
  "site/hero-humanitarian-aid.jpg"                     = "2025/04/img_5135.jpg"

  # ── People: Director ──
  "people/nasir-uddin.jpg"                             = "2025/05/rahman-nasir-uddin-1.jpg"

  # ── People: Research Fellows ──
  "people/abdullah-al-faruk.png"                       = "2025/05/faruk.png"
  "people/s-monirul-hassan.png"                        = "2025/05/hassan-bhai.jpg.png"
  "people/panab-kumar-panday.png"                      = "2025/05/screenshot-2025-05-19-at-1.25.15e280afam.png"
  "people/md-danesh-miah.jpeg"                         = "2025/05/daneshi-mia.jpeg"
  "people/laila-ashrafun.jpg"                          = "2025/05/laila.jpg"
  "people/alak-paul.jpeg"                              = "2025/05/alak-paul.jpeg"
  "people/shahab-enam-khan.jpeg"                       = "2025/05/shahab-1-1.jpeg"
  "people/amir-mohammad-nasrullah.png"                 = "2025/05/amir-mohammad-nasrullah.png"
  "people/rafiqul-islam.jpeg"                          = "2025/05/whatsapp-image-2025-05-19-at-01.11.09.jpeg"
  "people/muhammad-faridul-alam.jpg"                   = "2025/05/faridul-alam-1.jpg"
  "people/rakiba-nabi.png"                             = "2025/05/rakiba-nabi.png"
  "people/masud-kamal.png"                             = "2026/06/masud-kamal.png"

  # ── People: Research Associates ──
  "people/sadat-al-sajib.jpg"                          = "2025/05/sajib.jpg"
  "people/muhammad-kazim-nur-sohad.png"                = "2025/05/sohad-1.png"
  "people/mohammad-delwar-hosen.jpeg"                  = "2025/05/delawar.jpeg"
  "people/mohammad-mohiuddin.png"                      = "2026/03/122_7kdhn629fm.jpg-12.png"
  "people/md-faruk-hossain.jpeg"                       = "2026/06/whatsapp-image-2025-05-17-at-23.24.42-1.jpeg"
  "people/farzana-habib.jpeg"                          = "2025/06/farzana-habib.jpeg"
  "people/ayesha-siddika.jpg"                          = "2025/07/15085aae-af09-4fa5-bc13-28205a8e4a39-1.jpg"
  "people/tahura-enam-navile.jpg"                      = "2025/06/te-navile.jpg"

  # ── People: Researchers ──
  "people/md-daiyan-belal.png"                         = "2025/05/belal.png"
  "people/sadrul-alam-kanok.jpeg"                      = "2025/05/kanok.jpeg"

  # ── People: Research Assistants (Full-Time) ──
  "people/md-mahmudul-hasan.png"                       = "2026/06/file_0000000081d872079a191ec40029fdbd-1.png"
  "people/tanjiha-binte-kabir.png"                     = "2026/06/tanjiha-b-kabir-.png"

  # ── People: Research Assistants (Part-Time) ──
  "people/abdul-hamid.jpg"                             = "2026/06/hamid.jpg"
  "people/dilruba-alam.jpeg"                           = "2026/06/dilruba.jpeg"
  "people/md-safayet-hossain.png"                      = "2026/06/shafayet.png"
  "people/raisa-farnaz.jpeg"                           = "2026/06/raisa-farnaz.jpeg"
  "people/md-adil-bin-abdul-wahid.jpg"                 = "2026/06/adil.jpg"
  "people/suikraching-marma.jpeg"                      = "2026/06/suikraching.jpeg"

  # ── People: Non-Resident Fellows ──
  "people/b-william-silcock.jpg"                       = "2025/05/drbillsilcock.jpg-3.jpg"
  "people/david-fitzgerald.jpg"                        = "2025/05/david.jpg"
  "people/tesseltje-de-lange.png"                      = "2025/05/tessel.png"
  "people/william-paul-simmons.jpg"                    = "2025/06/bill-simmons.jpg"
  "people/dina-siddiqi.jpeg"                           = "2025/06/whatsapp-image-2025-06-09-at-12.24.34-1.jpeg"
  "people/nergis-canefe.jpg"                           = "2025/05/nergis-3.jpg"
  "people/a-dirk-moses.jpg"                            = "2025/06/moses.jpg"
  "people/palash-kamruzzaman.jpg"                      = "2025/05/pk_august-2022_1-3.jpg"
  "people/bree-akesson.jpg"                            = "2025/05/bree-5.jpg"
  "people/bayes-ahmed.jpg"                             = "2026/08/cropped-bayes-ahmed-scaled-1.jpg"
  "people/yuki-shiozaki.jpeg"                          = "2025/05/yuki.jpeg"
  "people/faheem-hussain.png"                          = "2025/05/faheem.png"
  "people/gregory-gondwe.png"                          = "2025/05/gregorygondwe.png"
  "people/vikramaditya-thakur.jpeg"                    = "2025/05/vikram.jpeg"
  "people/ashley-stewart-tufescu.jpg"                  = "2025/05/ashley.jpg"
  "people/tazreena-sajjad.jpg"                         = "2025/06/photo-5.jpg"
  "people/ronan-lee.jpg"                               = "2025/05/ronan-lee-profile-2024-.jpg"

  # ── People: Research Affiliates ──
  "people/md-habibur-rahman.jpg"                       = "2025/06/md-habibur-rahman-1.jpg"
  "people/diotima-chattoraj.jpg"                       = "2025/06/diotima-2.jpg"
  "people/nyadi-francios-ndzi.jpg"                     = "2025/06/nyadi-francios-ndzi-photo-1.jpg"
  "people/nazia-khan.jpg"                              = "2025/06/dr-nazia_khan_photo-2.jpg"
  "people/amadu-wurie-khan.jpg"                        = "2025/06/img_20210210_124418129_2-002.jpg"
  "people/ibtesum-afrin.jpeg"                          = "2025/06/ibtesum-afrin-with-book-2e2a1136-1.jpeg"
  "people/doris-ijeoma-ajah-okohu.png"                 = "2025/06/image-2-1.png"
  "people/sarah-nandi.png"                             = "2025/06/headshot_nandi-sarahnandi.png"
  "people/niger-sultana.jpeg"                          = "2025/06/sultana_image.jpeg"
  "people/kazi-ashraf-uddin.jpeg"                      = "2025/06/whatsapp-image-2025-06-05-at-15.07.47.jpeg"
  "people/konok-chapa-das.png"                         = "2025/06/screenshot-2025-06-05-at-6.52.17e280afpm.png"
  "people/gazal-khan.jpg"                              = "2025/06/gazal-picture.jpg"
  "people/valentina-grillo.png"                        = "2025/07/screenshot-2025-07-02-at-3.52.49e280afam.png"
  "people/mamoon-bhuyan.jpg"                           = "2025/06/mamoon-1.jpg"
  "people/nikita-gehlot.jpg"                           = "2025/06/1000100594-1.jpg"

  # ── Publications ──
  "publications/rohingya-ethnography.png"              = "2025/04/the-rohingya_an-ethnography-of-subhuman.png"
  "publications/rohingya-crisis.png"                   = "2025/05/the-rohingya-crisis.png"

  # ── Events ──
  "events/wrd-2026.png"                                = "2025/04/final_wrd-2026.png"
  "events/rohingya-genocide-day-2026.png"              = "2026/08/rohingya-genocide-day-2026_final.png"
  "events/rohingya-genocide-day-2025.png"              = "2025/08/rml-flyer-3.png"
  "events/digital-homeland-seminar.png"                = "2026/08/seminar-on-digital-citizenship_rml_suruchi_2026-2.png"
  "events/research-colloquium-2025.png"                = "2025/07/screenshot-2025-07-08-at-12.04.08-pm.png"
  "events/wrd-2025.png"                                = "2025/06/final_refugee-day-discussion_10625.png"

  # ── Research ──
  "research/digital-literacy.jpg"                      = "2025/04/img_20210916_120351.jpg"
  "research/humanitarian-aid.jpg"                      = "2025/04/img_5135.jpg"

  # ── Media (reuse some) ──
  "media/wrd-2026.png"                                 = "2025/04/final_wrd-2026.png"
  "media/rohingya-genocide-day-2026.png"               = "2026/08/rohingya-genocide-day-2026_final.png"
  "media/rohingya-ethnography.png"                     = "2025/04/the-rohingya_an-ethnography-of-subhuman.png"
}

$success = 0
$fail = 0

foreach ($entry in $downloads.GetEnumerator()) {
  $localRel = $entry.Key
  $wpPath   = $entry.Value
  $localFull = Join-Path $imgBase $localRel

  if (Test-Path $localFull) {
    Write-Host ("SKIP  {0}" -f $localRel)
    $success++
    continue
  }

  $dir = Split-Path $localFull -Parent
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }

  $url = $baseUrl + $wpPath
  try {
    Invoke-WebRequest -Uri $url -OutFile $localFull -UseBasicParsing -TimeoutSec 30
    $size = (Get-Item $localFull).Length
    Write-Host ("OK    {0}  ({1} bytes)" -f $localRel, $size)
    $success++
  } catch {
    $errMsg = $_.Exception.Message
    Write-Host ("FAIL  {0}  - {1}" -f $localRel, $errMsg)
    $fail++
  }
}

Write-Host ""
Write-Host ("Done: {0} ok, {1} failed" -f $success, $fail)
