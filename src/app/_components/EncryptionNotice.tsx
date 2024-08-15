import { type User } from "@prisma/client";
import Link from "next/link";
import Button from "./Button";
import FormButton from "./FormButton";

export default function EncryptionNotice({
  user,
  mdkJwk,
}: {
  user?: User;
  mdkJwk?: JsonWebKey;
}) {
  return (
    <>
      {user?.sukMdk && user?.passwordSalt && !mdkJwk && (
        <div className="m-4 flex w-full flex-col items-center justify-center gap-4 rounded-lg bg-yellow-100/30 p-4">
          <h2 className="text-3xl font-light">decrypt your data to continue</h2>
          <div className="flex flex-row items-center gap-4">
            <Link href="/settings">
              <Button>enter data passphrase</Button>
            </Link>
            <div>or</div>
            <div>
              <form action="">
                <FormButton>reload the page</FormButton>
              </form>
            </div>
          </div>
          <div className="text-sm">
            <p>
              if you entered your passphrase already on this device, reload the
              page to continue.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
