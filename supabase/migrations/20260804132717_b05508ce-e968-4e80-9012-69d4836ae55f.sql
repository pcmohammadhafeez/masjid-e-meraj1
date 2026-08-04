CREATE TABLE public.quran_pages (
  id text PRIMARY KEY DEFAULT 'default',
  bucket text NOT NULL DEFAULT 'quran-pages',
  prefix text NOT NULL DEFAULT 'v1',
  page_count integer NOT NULL DEFAULT 0,
  ext text NOT NULL DEFAULT 'webp',
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.quran_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quran_pages TO authenticated;
GRANT ALL ON public.quran_pages TO service_role;

ALTER TABLE public.quran_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read quran pages" ON public.quran_pages FOR SELECT USING (true);
CREATE POLICY "Admins manage quran pages" ON public.quran_pages FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER quran_pages_updated_at BEFORE UPDATE ON public.quran_pages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO public.quran_pages (id, bucket, prefix, page_count, ext)
VALUES ('default', 'quran-pages', 'v1', 619, 'webp');

CREATE POLICY "Anyone can read quran page images" ON storage.objects FOR SELECT
  USING (bucket_id = 'quran-pages');
CREATE POLICY "Admins manage quran page images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'quran-pages' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update quran page images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'quran-pages' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete quran page images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'quran-pages' AND has_role(auth.uid(), 'admin'::app_role));