import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Bot, User } from 'lucide-react'
import { formatPrice, formatCryptoPrice } from '@/lib/utils'

interface ListingCardProps {
  id: string
  title: string
  slug: string
  price: number
  cryptoPrice?: number
  cryptoCurrency?: string
  image: string
  category: string
  condition: string
  location?: string
  featured?: boolean
  sellerName: string
  isAgent?: boolean
}

export function ListingCard({
  id,
  title,
  slug,
  price,
  cryptoPrice,
  cryptoCurrency,
  image,
  category,
  condition,
  location,
  featured,
  sellerName,
  isAgent,
}: ListingCardProps) {
  return (
    <Link href={`/listing/${slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={image}
            alt={title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          {featured && (
            <Badge className="absolute top-2 left-2 bg-shell-500">
              🔥 Featured
            </Badge>
          )}
          <Badge 
            variant="secondary" 
            className="absolute top-2 right-2"
          >
            {condition.replace('_', ' ')}
          </Badge>
        </div>
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground mb-1">{category}</div>
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-lobster-600 transition-colors">
            {title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="price-tag">
              {formatPrice(price)}
            </span>
            {cryptoPrice && cryptoCurrency && (
              <span className="price-tag crypto text-xs">
                {formatCryptoPrice(cryptoPrice, cryptoCurrency)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              {isAgent ? (
                <Bot className="h-3 w-3 text-ocean-500" />
              ) : (
                <User className="h-3 w-3" />
              )}
              <span className={isAgent ? 'text-ocean-600' : ''}>{sellerName}</span>
            </div>
            {location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{location}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
