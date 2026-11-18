import React,{useEffect,useState} from 'react';
import type {Book} from '../../types';
interface Props{book:Partial<Book>&{title:string};className?:string;style?:React.CSSProperties}
const palettes=[['#17324d','#f2c66e'],['#62334a','#ffb6b3'],['#204d44','#c1e1a4'],['#443e7e','#e0c8ff'],['#683e26','#ffdb9e'],['#1a5264','#aadfeb']];
export default function BookCover({book,className='',style}:Props){const [failed,setFailed]=useState(false);useEffect(()=>setFailed(false),[book.coverImage]);
 if(book.coverImage&&!failed)return <img src={book.coverImage} alt={`Bìa minh họa ${book.title}`} className={className} style={{display:'block',width:'100%',height:'100%',objectFit:'cover',...style}} loading="lazy" onError={()=>setFailed(true)}/>;
 const seed=Array.from(book.title).reduce((s,ch)=>s+ch.charCodeAt(0),0);const [bg,fg]=palettes[seed%palettes.length];
 return <div className={`fallback-cover ${className}`} role="img" aria-label={`Bìa minh họa ${book.title}`} style={{background:bg,color:fg,...style}}><span className="fallback-sun">✦</span><strong>{book.title}</strong><small>BÌA MINH HỌA</small></div>;
}
