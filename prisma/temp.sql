ALTER TABLE BlogPost ADD COLUMN urlStub TEXT;
CREATE UNIQUE INDEX BlogPost_urlStub_key ON BlogPost(urlStub);
