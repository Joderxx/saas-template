import { Html, Body, Text, Head, Tailwind } from "@react-email/components";

type RegisterValidProps = {
  code: string
}

export default function RegisterValid({ code }: RegisterValidProps) {
  return (
    <Html>
      <Tailwind>
        <Body>
          <Text className="text-3xl font-bold my-4">Confirm your email address.</Text>
          <Text className="text-sm my-4">
            Let’s make sure this is the right email address for you. Please enter this verification code for register:
          </Text>
          <Text className="text-xl font-bold my-4">
            {code}
          </Text>
          <Text className="text-sm my-4">
            Verification codes expire after 5 minutes.
          </Text>
        </Body>
      </Tailwind>
    </Html>
  )
}