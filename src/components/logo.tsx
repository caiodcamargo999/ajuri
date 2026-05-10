import Image from "next/image"

export const Logo = () => {
    return (
        <div className="flex items-center gap-3 group">
            <Image
                src="/logo.png"
                alt="Ajuri Logo"
                width={140}
                height={50}
                quality={100}
                className="object-contain h-12 w-auto"
            />
        </div>
    )
}
