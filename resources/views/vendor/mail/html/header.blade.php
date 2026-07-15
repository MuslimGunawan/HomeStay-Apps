@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
@php
    $homestayName = cache('branding_homestay_name', 'Yuri-HomeStay');
    $logoPath = cache('branding_logo');
    // Generate absolute URL for logo in email
    $logoUrl = $logoPath ? asset($logoPath) : null;
@endphp
@if ($logoUrl)
    <img src="{{ $logoUrl }}" class="logo" alt="{{ $homestayName }}" style="max-height: 50px;">
@elseif (trim($slot) === 'Laravel')
    <span style="font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: bold; color: #d4af37;">{{ $homestayName }}</span>
@else
    {!! $slot !!}
@endif
</a>
</td>
</tr>
