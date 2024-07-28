"use server";
import FormButton from "~/app/_components/FormButton";
import Input from "~/app/_components/Input";
import { getNewImageUrl } from "~/utils/_uploads";

export default async function Image() {
  return (
    <div>
      <form
        action={async (formData) => {
          "use server";
          const imageFile = formData.get("imageFile") as File;
          const imageUrl = await getNewImageUrl({ imageFile });
          console.log("imageUrl: ", imageUrl);
        }}
      >
        <Input
          label="image"
          type="file"
          id="imageFile"
          name="imageFile"
          fileSelectButtonLabel="choose image"
        />
        <FormButton isSpecial variant="submit">
          upload
        </FormButton>
      </form>
    </div>
  );
}
